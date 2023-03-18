import styled from "styled-components";
import React from "react";

const StyledButton = styled.button`
  background: linear-gradient(to right, #14163c 0%, #03217b 79%);
  text-transform: uppercase;
  letter-spacing: 0.2rem;
  height: 3rem;
  border: none;
  color: white;
  border-radius: 2rem;
  cursor: pointer;
  margin: 0.75rem 0;
`;

type ButtonProps = {
  content: string;
  onClick?: () => void;
  width: string;
};

export default function Button({
  content,
  onClick,
  width
}: ButtonProps): styled {
  return (
    <StyledButton
      onClick={onClick}
      style={{ width: width }}
    >
      {content}
    </StyledButton>
  );
}
