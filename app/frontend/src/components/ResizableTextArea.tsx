// ResizableTextarea.tsx
import React, { forwardRef } from "react";
import styled from "styled-components";

const StyledTextarea = styled.textarea`
  overflow-y: scroll;
  overflow-x: hidden;
  min-height: 38px;
  height: 100%;
  max-height: 100%;
  width: 100%;
  outline: none;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  cursor: auto;
  resize: none; 
::-webkit-scrollbar {
    width: 12px;
}

::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); 
    -webkit-border-radius: 10px;
    border-radius: 10px;
}

::-webkit-scrollbar-thumb {
    -webkit-border-radius: 10px;
    border-radius: 10px;
    background: rgba(255,255,255,0.8); 
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5); 
}

::-webkit-scrollbar-thumb:window-inactive {
  background: rgba(255,255,255,0.4); 
}

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
