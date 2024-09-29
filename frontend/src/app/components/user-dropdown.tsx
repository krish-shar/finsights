"use client";
import React, { useEffect, useRef, useState } from "react";
import { LogoutButton } from "@/app/components/buttons";
import { useRouter } from "next/navigation";

// interface Option {
//     label: string;
//     value: string;
// }

const UserDropdown = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  // const [options, setOptions] = useState<Option[]>([]);
  // const [user, setUser] = useState(null);
  // const router = useRouter();

  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setDropdownOpen(false);
    }
  };

  const handleLogout = () => {
    router.push("/api/auth/logout");
  };

  // const handleSignOut = () => {
  //     router.push('/home');
  //     resetUser();
  // };
  //
  // const getOptions = (userType: string | null) => {
  //     switch (userType) {
  //         case "user":
  //             return [
  //                 {label: "Edit Profile", value: "/edit"},
  //                 {label: "Order History", value: "/history"},
  //                 {label: "Sign Out", value: "signout"},
  //             ];
  //         case "admin":
  //             return [
  //                 {label: "Edit Profile", value: "/edit"},
  //                 {label: "Manage Users", value: "/manage/users"},
  //                 {label: "Manage Movies", value: "/manage/movies"},
  //                 {label: "Manage Promotions", value: "/manage/promotions"},
  //                 {label: "Sign Out", value: "signout"},
  //             ];
  //         default:
  //             return [
  //                 {label: "Login", value: "/login"},
  //                 {label: "Sign Up", value: "/register"},
  //             ];
  //     }
  // };
  //
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    console.log(dropdownOpen);
  }, [dropdownOpen]);

  // useEffect(() => {
  //     setOptions(
  //         getOptions(user == nullUser ? "guest" : user.admin ? "admin" : "user"),
  //     );
  // }, [user]);

  return (
    <div>
      <div
        onClick={() => {
          setDropdownOpen(!dropdownOpen);
        }}
      >
        <img
          className="w-12 h-12 rounded-full"
          src="https://toolset.com/wp-content/uploads/2018/06/909657-profile_pic.png"
          alt="https://via.placeholder.com/50x50"
        />
      </div>
      <div className="absolute pt-2 right-[6vw]">
        {dropdownOpen && (
          <div
            ref={ref}
            className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
          >
            <div className="w-max h-full p-4">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-4">
                  <div className="text-lg font-bold">John Doe</div>
                  <LogoutButton onClick={handleLogout} />
                  <div className="text-sm"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDropdown;
