"use client";
import React, { useEffect, useState } from "react";
// import { HoveredLink, Menu, MenuItem, ProductItem } from "./navbar-menu";
import { cn } from "@/app/lib/utils";
import SearchBar from "@/app/components/searchbar";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import UserDropdown from "@/app/components/user-dropdown";
import { useUser } from "@auth0/nextjs-auth0/client";
import { LoginButton } from "@/app/components/buttons";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      console.log("User data fetched:", user);
      fetch("/api/user", { method: "POST" })
        .then((response) => response.json())
        .then((data) => console.log("User data saved:", data))
        .catch((error) => console.error("Error saving user data:", error));
    } else {
      console.log("No user");
    }
  }, [user]);

  const handleLogin = () => {
    router.push("/api/auth/login");
  };

  const handleSearch = () => {
    if (search.trim()) {
      router.push(`/search?ticker=${search.trim().toUpperCase()}`);
    }
    setSearch("");
  };

  return (
    <div
      className={cn(
        "fixed items-center top-2 inset-x-0 max-w-8xl max-h-24 z-5",
        className,
      )}
    >
      <Menu setActive={setActive}>
        <div
          className="flex items-center cursor-pointer z-20"
          onClick={() => {
            router.replace("/");
          }}
        >
          <Image src="/logo.png" alt="/logo.png" width={50} height={50} />
          <div className="text-2xl font-bold px-4">FINSIGHT</div>
        </div>
        <SearchBar
          className="absolute w-1/3 flex left-1/2 transform -translate-x-1/2 z-10"
          search={search}
          setSearch={setSearch}
          placeholder="Search a Company"
          icon={FaSearch}
          handleSearch={handleSearch}
        />
        {user ? (
          <UserDropdown className="z-20" />
        ) : (
          <LoginButton onClick={handleLogin} className="z-20" />
        )}
      </Menu>
    </div>
  );
}

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      onMouseEnter={() => setActive(item)}
      className="relative flex items-center"
    >
      <motion.p
        transition={{ duration: 0.3 }}
        className="cursor-pointer text-black text-center hover:opacity-[0.9] dark:text-white"
      >
        {item}
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active" // layoutId ensures smooth animation
                className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
              >
                <motion.div
                  layout // layout ensures smooth animation
                  className="w-max h-full p-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)} // resets the state
      className="relative h-full items-center rounded-2xl border border-transparent dark:bg-black dark:border-accent-dark bg-white shadow-input flex justify-between space-x-4 p-4"
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <Link href={href} className="flex space-x-2">
      <Image
        src={src}
        width={140}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black dark:text-white">
          {title}
        </h4>
        <p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300">
          {description}
        </p>
      </div>
    </Link>
  );
};

export const HoveredLink = ({ href, children }) => {
  return (
    <Link
      href={href}
      className="text-neutral-700 dark:text-neutral-200 hover:text-black "
    >
      {children}
    </Link>
  );
};

export default Navbar;
