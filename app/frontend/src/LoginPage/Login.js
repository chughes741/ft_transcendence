import classes from './Login.css'
import { useState } from 'react'

export default function Login() {
  const [nick, setNick] = useState('');
  const [pass, setPass] = useState('');


  const handleNick = (event) => {
    setNick(event.target.value);
  };

  const handlePass = (event) => {
    setPass(event.target.value);
  };

   function handleSubmit(){
    if (nick === 'BigBoss')
    {
      console.log("AFDHDHFA");
      return;
    }
  };


  return (
    <div className="wrapper">
      <form className="form" onSubmit={handleSubmit} action="/login">
        <div className="login-container">
          <div className="login-info-container">
            <input required value={nick} onChange={handleNick} className="login-field" type="text" placeholder="Nickname" />
          </ div>
          <div className="login-info-container">
            <input value={pass} onChange={handlePass} required className="login-field" type="password" placeholder="Password" />
          </div>
          <div className="login-info-container">
            <button className="bouton main" type="submit">Connect</button>
          </div>
        </div>
      </form>
      NICK = {nick}
      <br/>
      PASS = {pass}
    </div>
  )
}

