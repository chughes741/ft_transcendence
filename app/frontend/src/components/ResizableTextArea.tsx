// ResizableTextarea.tsx
import React, { forwardRef } from "react";
import styled from "styled-components";

const StyledTextarea = styled.textarea`
  resize: vertical;
  overflow: scroll;
  min-height: 38px;
  max-height: 40 vh;
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

const ResizableTextArea = forwardRef<HTMLDivElement, ResizableTextareaProps>(
  ({ value, placeholder, onChange, onEnterPress }, ref) => {
    const handleKeyPress = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && onEnterPress) {
        event.preventDefault();
        onEnterPress(event);
      }
    };

    return (
      <StyledTextarea
        ref={ref}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onKeyPress={handleKeyPress}
      />
    );
  }
);

export default ResizableTextArea;
