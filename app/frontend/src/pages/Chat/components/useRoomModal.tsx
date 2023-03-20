import { useState, useRef, useEffect } from "react";

export const useRoomModal = (
  showModal: boolean,
  closeModal: () => void,
  handleSubmit: () => void
) => {
  const [roomName, setRoomName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const roomNameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showModal && roomNameInput.current) {
      roomNameInput.current.focus();
    }
  }, [showModal]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
    if (e.key === "Escape") {
      closeModal();
    }
  };

  return {
    roomName,
    setRoomName,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    roomNameInput,
    togglePasswordVisibility,
    handleKeyPress
  };
};
