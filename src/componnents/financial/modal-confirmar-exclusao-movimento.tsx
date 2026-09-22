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
import { MovementsType } from "@/types/financial-types";
import { formatarValorBR } from "@/utils/convert-to-real";

type Props = {
  movement: MovementsType | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ModalConfirmarExclusaoMovimento({
  movement,
  isLoading,
  onClose,
  onConfirm,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={!!movement}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay />
      <AlertDialogContent mx={{ base: 4 }}>
        <AlertDialogHeader fontSize="lg" fontWeight="bold">
          Excluir movimentação
        </AlertDialogHeader>

        <AlertDialogBody>
          Deseja excluir a movimentação <b>{movement?.name}</b> no valor de{" "}
          <b>R$ {formatarValorBR(movement?.value ?? 0)}</b>? Esta ação não pode
          ser desfeita.
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
