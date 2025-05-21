import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface RegistrationConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationConfirmationDialog: React.FC<RegistrationConfirmationDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-darkgray-800 text-white border border-darkgray-400 rounded-lg p-6'>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">Registration Successful</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="flex flex-col items-center">
            <p className="mb-4 text-lg text-center">Your registration was successful! Welcome to our platform.</p>
            <Button onClick={onClose} className="w-full text-white bg-[#BA0C2F] border-[#BA0C2F] border hover:bg-[#98001D] py-2 px-4 rounded-md">
              OK
            </Button>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationConfirmationDialog;