import { UserInfo } from "@/components/user-info";
import { getUser } from "@/actions/getUser";

const ServerPage = async () => {
  const {user} = await getUser();

  return ( 
    <UserInfo
      label="💻 Server component"
      user={user?.user}
    />
   );
}
 
export default ServerPage;
