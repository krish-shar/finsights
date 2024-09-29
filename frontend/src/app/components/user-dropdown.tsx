"use client";
import React, { useEffect, useRef, useState } from "react";
import { DropdownButton } from "@/app/components/buttons";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";

// interface Option {
//     label: string;
//     value: string;
// }

const UserDropdown = ({ className }: { className?: string }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, error, isLoading } = useUser();
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

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={className}>
      <div
        onClick={() => {
          if (!dropdownOpen) {
            setDropdownOpen(true);
          }
        }}
      >
        <img
          className="w-12 h-12 cursor-pointer"
          src="https://cdn-icons-png.freepik.com/512/7835/7835466.png"
          alt="https://via.placeholder.com/50x50"
        />
      </div>
      <div className="absolute pt-2 right-0">
        {dropdownOpen && (
          <div
            ref={ref}
            className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-accent-dark shadow-xl"
          >
            <div className="w-max h-full p-4">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-4">
                  <div className="text-xl font-bold">
                    {user && user["name"]}
                  </div>
                  <DropdownButton text="Watching" onClick={() => {}} />
                  <DropdownButton text="Logout" onClick={handleLogout} />
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
