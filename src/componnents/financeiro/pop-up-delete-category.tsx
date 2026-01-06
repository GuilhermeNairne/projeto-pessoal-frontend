import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { useRef } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
};

export function PopUpDeleteCategory({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  function handleConfirm() {
    onConfirm(), onClose();
  }

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogHeader fontSize="lg" fontWeight="bold">
          Deletar categoria
        </AlertDialogHeader>

        <AlertDialogBody>
          Deseja excluir a categoria <b>{categoryName}</b>?
        </AlertDialogBody>

        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose}>
            Cancel
          </Button>

          <Button
            color={"white"}
            bg={"menu_principal"}
            ml={3}
            onClick={handleConfirm}
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
