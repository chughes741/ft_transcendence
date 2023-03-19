import "./ButtonFunky.tsx.css";

type ButtonProps = {
  content: string;
  onClick?: () => void;
  width: string;
};

export default function ButtonFunky({ content, onClick, width }: ButtonProps) {
  return (
    <div
      className="button-funky"
      onClick={onClick}
      style={{ width: width }}
    >
      <div className="button-funky-bg"></div>
      <span className="button-funky-content">{content}</span>
    </div>
  );
}
