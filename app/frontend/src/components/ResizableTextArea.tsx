// ResizableTextarea.tsx
import React from "react";
import styled from "styled-components";

const StyledTextarea = styled.textarea`
  resize: none;
  overflow: hidden;
  min-height: 38px;
  max-height: 200px;
  width: 100%;
  outline: none;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 0.5rem 1rem;
`;

type ResizableTextareaProps = {
  value: string;
  placeholder?: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onEnterPress?: (event: React.KeyboardEvent) => void;
};

const ResizableTextarea: React.FC<ResizableTextareaProps> = ({
  value,
  placeholder,
  onChange,
  onEnterPress
}) => {
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && onEnterPress) {
      event.preventDefault();
      onEnterPress(event);
    }
  };

  return (
    <StyledTextarea
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      onKeyPress={handleKeyPress}
    />
  );
};

export default ResizableTextarea;
