"use client";

import { UserInfo } from "@/components/user-info";
import { useSession } from "@/context/SessionContext";
const ClientPage = () => {
  const user = useSession();

  return ( 
    <UserInfo
      label="📱 Client component"
      user={user}
    />
   );
}
 
export default ClientPage;
