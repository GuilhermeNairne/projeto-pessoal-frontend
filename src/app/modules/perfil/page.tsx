"use client";

import { useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Stack,
  Text,
  Divider,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { FaCamera, FaSave, FaTrash, FaPencilAlt } from "react-icons/fa";
import { Menu } from "@/componnents/menu";
import { MenuMobile } from "@/componnents/menu-mobile";
import { DefaultInput } from "@/componnents/default-input";
import { DefaultButton } from "@/componnents/default-button";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";

const defaultPicture =
  "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg";

export default function Perfil() {
  const { user, signOut, updateUser } = useAuthContext();
  const {
    updateUsername,
    changePassword,
    uploadProfilePicture,
    deleteAccount,
  } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [profilePicture, setProfilePicture] = useState<string>(
    user?.profilePicture || defaultPicture,
  );
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState(user?.name ?? "");
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  function handleSelectPicture() {
    fileInputRef.current?.click();
  }

  async function handlePictureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        position: "top",
        status: "error",
        isClosable: true,
        title: "Arquivo inválido",
        description: "Selecione um arquivo de imagem.",
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProfilePicture(previewUrl);

    try {
      setIsUploadingPicture(true);
      const data = await uploadProfilePicture(file);

      updateUser({ profilePicture: data.profilePicture });

      toast({
        position: "top",
        status: "success",
        isClosable: true,
        title: "Foto de perfil atualizada!",
      });
    } catch {
      setProfilePicture(user?.profilePicture || defaultPicture);

      toast({
        position: "top",
        status: "error",
        isClosable: true,
        title: "Erro ao atualizar a foto de perfil!",
      });
    } finally {
      setIsUploadingPicture(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleChangeUsername() {
    if (!username.trim()) {
      toast({
        position: "top",
        status: "warning",
        isClosable: true,
        title: "Informe um nome de usuário válido.",
      });
      return;
    }

    try {
      setIsSavingUsername(true);

      await updateUsername(username.trim());
      updateUser({ name: username.trim() });

      toast({
        position: "top",
        status: "success",
        isClosable: true,
        title: "Nome de usuário atualizado com sucesso!",
      });

      setIsEditingUsername(false);
    } catch {
      toast({
        position: "top",
        status: "error",
        isClosable: true,
        title: "Erro ao atualizar o nome de usuário!",
      });
    } finally {
      setIsSavingUsername(false);
    }
  }

  function handleCancelEditUsername() {
    setUsername(user?.name ?? "");
    setIsEditingUsername(false);
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        position: "top",
        status: "warning",
        isClosable: true,
        title: "Preencha todos os campos de senha.",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        position: "top",
        status: "warning",
        isClosable: true,
        title: "A nova senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        position: "top",
        status: "warning",
        isClosable: true,
        title: "As senhas não coincidem.",
      });
      return;
    }

    try {
      setIsSavingPassword(true);

      await changePassword(currentPassword, newPassword);

      toast({
        position: "top",
        status: "success",
        isClosable: true,
        title: "Senha alterada com sucesso!",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 400) {
        toast({
          position: "top",
          status: "error",
          isClosable: true,
          title: "Senha atual incorreta.",
        });
      } else {
        toast({
          position: "top",
          status: "error",
          isClosable: true,
          title: "Erro ao alterar a senha!",
        });
      }
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    try {
      setIsDeletingAccount(true);

      await deleteAccount();

      toast({
        position: "top",
        status: "success",
        isClosable: true,
        title: "Conta excluída com sucesso.",
      });

      onClose();
      signOut();
    } catch {
      toast({
        position: "top",
        status: "error",
        isClosable: true,
        title: "Erro ao excluir a conta!",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <Flex
      w={"100%"}
      h={"100%"}
      p={{ base: "10px", lg: "20px" }}
      flexDir={{ base: "column", lg: "row" }}
      gap={{ base: 4, lg: 10 }}
      overflow="hidden"
    >
      <MenuMobile />
      <Menu />

      <Box w={{ base: "100%", lg: "80%" }} overflow="auto" pb={10}>
        <Text fontSize={{ base: "xl", lg: "2xl" }} fontWeight={"bold"}>
          Configurações da conta
        </Text>

        <Box
          mt={5}
          p={{ base: 4, lg: 6 }}
          bg={"surface.card"}
          borderRadius={8}
          boxShadow={"md"}
        >
          <Text fontSize={{ base: "md", lg: "lg" }} fontWeight={"bold"} mb={4}>
            Meus dados
          </Text>

          <Flex
            flexDir={{ base: "column", md: "row" }}
            alignItems={{ base: "center", md: "flex-start" }}
            gap={{ base: 4, md: 8 }}
          >
            <Flex flexDir={"column"} alignItems={"center"} gap={2}>
              <Box position={"relative"} opacity={isUploadingPicture ? 0.6 : 1}>
                <Avatar size={"2xl"} src={profilePicture} name={user?.name} />
                <Icon
                  as={FaCamera}
                  boxSize={5}
                  position={"absolute"}
                  bottom={1}
                  right={1}
                  bg={"menu_principal"}
                  color={"white"}
                  borderRadius={"full"}
                  p={1}
                  boxSizing={"content-box"}
                  cursor={isUploadingPicture ? "not-allowed" : "pointer"}
                  onClick={() => !isUploadingPicture && handleSelectPicture()}
                  boxShadow={"md"}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePictureChange}
                />
              </Box>
              <Text
                fontSize={"sm"}
                color={"text.primary"}
                fontWeight={"semibold"}
                cursor={"pointer"}
                onClick={handleSelectPicture}
              >
                Alterar foto
              </Text>
            </Flex>

            <Stack flex={1} w={"100%"} spacing={4}>
              <Box>
                <Text fontWeight={"bold"}>Nome de usuário</Text>

                {isEditingUsername ? (
                  <HStack mt={2} alignItems={"flex-start"}>
                    <DefaultInput
                      position="cima"
                      title=""
                      placeholder="Informe seu nome de usuário"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      w="250px"
                    />
                    <DefaultButton
                      icon={FaSave}
                      title="Salvar"
                      h="40px"
                      w="120px"
                      mt={"4px"}
                      isLoading={isSavingUsername}
                      onClick={handleChangeUsername}
                    />
                    <Button
                      variant="ghost"
                      mt={"4px"}
                      onClick={handleCancelEditUsername}
                    >
                      Cancelar
                    </Button>
                  </HStack>
                ) : (
                  <HStack mt={1} gap={3}>
                    <Text color={"text.muted"}>{user?.name}</Text>
                    <Icon
                      as={FaPencilAlt}
                      boxSize={4}
                      cursor={"pointer"}
                      color={"text.primary"}
                      onClick={() => setIsEditingUsername(true)}
                    />
                  </HStack>
                )}
              </Box>

              <Box>
                <Text fontWeight={"bold"}>E-mail</Text>
                <Text mt={1} color={"text.muted"}>
                  {user?.email}
                </Text>
              </Box>
            </Stack>
          </Flex>
        </Box>

        <Box
          mt={5}
          p={{ base: 4, lg: 6 }}
          bg={"surface.card"}
          borderRadius={8}
          boxShadow={"md"}
        >
          <Text fontSize={{ base: "md", lg: "lg" }} fontWeight={"bold"} mb={4}>
            Alterar senha
          </Text>

          <Stack spacing={4} maxW={{ base: "100%", md: "400px" }}>
            <DefaultInput
              position="cima"
              title="Senha atual"
              placeholder="Informe sua senha atual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <DefaultInput
              position="cima"
              title="Nova senha"
              placeholder="Informe a nova senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <DefaultInput
              position="cima"
              title="Confirmar nova senha"
              placeholder="Confirme a nova senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <DefaultButton
              icon={FaSave}
              title="Alterar senha"
              w={{ base: "100%", md: "200px" } as any}
              isLoading={isSavingPassword}
              onClick={handleChangePassword}
            />
          </Stack>
        </Box>

        <Box
          mt={5}
          p={{ base: 4, lg: 6 }}
          bg={"surface.card"}
          borderRadius={8}
          boxShadow={"md"}
          borderWidth={1}
          borderColor={"red.300"}
        >
          <Text
            fontSize={{ base: "md", lg: "lg" }}
            fontWeight={"bold"}
            mb={2}
            color={"red.500"}
          >
            Excluir conta
          </Text>
          <Text color={"text.muted"} mb={4}>
            Ao excluir sua conta, todos os seus dados serão permanentemente
            removidos. Essa ação não pode ser desfeita.
          </Text>

          <Button
            leftIcon={<Icon as={FaTrash} />}
            colorScheme="red"
            variant="outline"
            onClick={onOpen}
          >
            Excluir minha conta
          </Button>
        </Box>
      </Box>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Excluir conta
          </AlertDialogHeader>

          <AlertDialogBody>
            <Text mb={3}>
              Tem certeza que deseja excluir sua conta <b>{user?.name}</b>?
            </Text>
            <Text color={"text.muted"} fontSize={"sm"}>
              Esta ação é permanente e não pode ser desfeita. Todos os dados
              associados à sua conta, incluindo contas financeiras, tarefas,
              categorias e notificações cadastradas, serão excluídos
              definitivamente.
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancelar
            </Button>

            <Button
              colorScheme="red"
              ml={3}
              isLoading={isDeletingAccount}
              onClick={handleDeleteAccount}
            >
              Excluir conta
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Flex>
  );
}
