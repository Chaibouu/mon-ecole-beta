import Link from "next/link";
import DarkModeSwitcher from "./DarkModeSwitcher";
import DropdownUser from "./DropdownUser";
import Image from "next/image";
import { useEffect, useState } from "react";
import SchoolSwitcher from "./SchoolSwitcher";
import { getProfile } from "@/actions/getProfile";

const HeaderClear = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const [branding, setBranding] = useState<{ logoUrl?: string; name?: string; color?: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await getProfile();
      if ((res as any).error) return;
      const data: any = (res as any).data;
      const sid = (typeof window !== 'undefined' && (document.cookie.split(';').find(c=>c.trim().startsWith('schoolId='))?.split('=')[1])) || data.selectedSchoolId;
      const school = data.schools?.find((s: any) => s.schoolId === sid) || data.schools?.[0];
      if (school) {
        setBranding({ logoUrl: school.logoUrl || undefined, name: school.name || undefined, color: school.brandPrimaryColor || undefined });
        if (school.brandPrimaryColor) document.documentElement.style.setProperty('--brand-primary', school.brandPrimaryColor);
        if (school.brandSecondaryColor) document.documentElement.style.setProperty('--brand-secondary', school.brandSecondaryColor);
      }
    };
    load();
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-gray-100 drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between pt-2 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* <!-- Hamburger Toggle BTN --> */}
          {/* <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black !delay-&lsqb;0&rsqb; duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!w-full delay-300"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "delay-400 !w-full"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!w-full delay-500"
                  }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!h-0 !delay-&lsqb;0&rsqb;"
                  }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!h-0 !delay-200"
                  }`}
                ></span>
              </span>
            </span>
          </button> */}
          {/* <!-- Hamburger Toggle BTN --> */}
        </div>

        <div className="hidden sm:flex items-center gap-3">
          {branding?.logoUrl ? (
            <Image src={branding.logoUrl} alt={branding.name || 'Logo'} width={120} height={36} />
          ) : null}
          {branding?.name ? (
            <span className="text-lg font-semibold" style={{ color: 'var(--brand-primary)' }}>{branding.name}</span>
          ) : null}
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <SchoolSwitcher />
          <ul className="flex items-center gap-2 2xsm:gap-4">
            <DarkModeSwitcher />
          </ul>
          <DropdownUser />
        </div>
      </div>
    </header>
  );
};

export default HeaderClear;
