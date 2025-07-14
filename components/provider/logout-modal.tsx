'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LogOut, Shield } from 'lucide-react';

interface ServiceProviderLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ServiceProviderLogoutModal({ 
  isOpen, 
  onClose, 
  onConfirm 
}: ServiceProviderLogoutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Secure Logout
          </DialogTitle>
          <DialogDescription>
            You are about to log out of the Atlantis HMS. This will end your current session and protect patient data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Security & Compliance
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your session will be terminated immediately</li>
              <li>• All session tokens will be invalidated</li>
              <li>• Logout event will be recorded in audit logs</li>
              <li>• No access to protected patient data after logout</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}