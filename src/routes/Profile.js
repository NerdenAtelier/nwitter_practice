//my profile 페이지 컴포넌트

import { authService } from "fbase";
import { useNavigate } from "react-router-dom"; //rrd v6 부터 useHistory -> useNavigate

const Profile = () => {
  const history = useNavigate();
  const onSignOutClick = () => {
    authService.signOut();
    history("/");
  };

  return (
    <>
      <button onClick={onSignOutClick}>Sign Out</button>
    </>
  );
};

export default Profile;
