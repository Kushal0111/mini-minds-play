
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface QuitGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onQuit: () => void;
}

const QuitGameDialog: React.FC<QuitGameDialogProps> = ({
  isOpen,
  onClose,
  onQuit,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Quit Game?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to quit the game? Your progress will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Continue Playing</AlertDialogCancel>
          <AlertDialogAction onClick={onQuit}>Quit Game</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default QuitGameDialog;
