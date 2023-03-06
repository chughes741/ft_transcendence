import { useEffect } from 'react';
export default function WelcomeTest() {

  useEffect(() => {
    document.body.classList.add('Welcome');
    return () => {
      document.body.classList.remove('Welcome');
    };
  });
  return (
      <>
          <div>ashdgaskjdhalkhdsalkjdahs</div>
      </>
  );
}
