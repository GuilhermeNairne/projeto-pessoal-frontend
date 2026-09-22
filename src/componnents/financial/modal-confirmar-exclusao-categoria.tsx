import { useRef } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { CategoriesType } from "@/types/financial-types";

type Props = {
  categoria: CategoriesType | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ModalConfirmarExclusaoCategoria({
  categoria,
  isLoading,
  onClose,
  onConfirm,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={!!categoria}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay />
      <AlertDialogContent mx={{ base: 4 }}>
        <AlertDialogHeader fontSize="lg" fontWeight="bold">
          Excluir categoria
        </AlertDialogHeader>

        <AlertDialogBody>
          Deseja excluir a categoria <b>{categoria?.name}</b>? Esta ação não
          pode ser desfeita.
        </AlertDialogBody>

        <AlertDialogFooter gap={3}>
          <Button ref={cancelRef} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="red" isLoading={isLoading} onClick={onConfirm}>
            Excluir
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
