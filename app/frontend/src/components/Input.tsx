import styled from "styled-components";
import ResizableTextarea from "./ResizableTextArea";

const StyledInput = styled.textarea`
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border-radius: 1rem;
  width: 98%;
  min-height: 3.5rem;
  max-height: 50%;
  padding: 1rem;
  border: none;
  outline: none;
  color: #3c354e;
  font-size: 0.9rem;
  resize: none;
  &:focus {
    display: flex;
    box-shadow: 0 0 0 0.2rem #b9abe0;
    backdrop-filter: blur(12rem);
    border-radius: 1rem;
  }
  &::placeholder {
    color: #b9abe099;
    font-weight: 100;
    font-size: 1rem;
  }
`;

type InputProps = {
  value: string;
  type: string;
  placeholder: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onEnterPress?: (event: React.KeyboardEvent) => void;
};

export default function Input({
  value,
  type,
  placeholder,
  onChange,
  onEnterPress
}: InputProps): styled {
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && onEnterPress) {
      event.preventDefault();
      onEnterPress(event);
    }
  };
  return (
    <StyledInput
      required
      as={type === "textarea" ? "textarea" : "input"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onEnterPress={handleKeyPress}
    />
  );
}
