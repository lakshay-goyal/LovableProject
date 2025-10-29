"use client"

import { Navbar, NavBody, NavbarLogo, NavItems, NavbarButton, MobileNav, MobileNavHeader, MobileNavToggle, MobileNavMenu } from "@/components/ui/resizable-navbar"
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";


const navItems = [
  { name: "Home", link: "/" },
  { name: "About", link: "#about" },
  { name: "Projects", link: "#projects" },
  { name: "Contact", link: "#contact" },
];

export default function NavigationBar() {
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();

  async function logoutHandler() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/signin");
        },
      },
    });
  }

  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch //refetch the session
  } = authClient.useSession()

  useEffect(() => {
    if (session) {
      setIsLogin(true);
    }
  }, [session]);

  return (
    <div>
      <Navbar>
        {/* Desktop Navbar */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          {isLogin ? (
            <div className="flex items-center gap-4">
              <div className="text-gray-700 hover:text-pink-600">
                Welcome, {session?.user?.name}
              </div>
              <NavbarButton variant="dark" onClick={logoutHandler}>
                Logout
              </NavbarButton>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NavbarButton variant="secondary" href="/signin">
                Sign In
              </NavbarButton>
              <NavbarButton variant="dark" href="/signup">
                Sign Up
              </NavbarButton>
            </div>
          )}
        </NavBody>

        {/* Mobile Navbar */}
        {/* <MobileNav>
            <MobileNavHeader>
              <NavbarLogo />
              <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
            </MobileNavHeader>

            <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.link}
                  onClick={() => setIsOpen(false)}
                  className="block w-full rounded-lg px-4 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  {item.name}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2 w-full">
                <NavbarButton variant="secondary" href="#login">
                  Login
                </NavbarButton>
                <NavbarButton variant="dark" href="#signup">
                  Sign Up
                </NavbarButton>
              </div>
            </MobileNavMenu>
          </MobileNav> */}
      </Navbar>
    </div>
  )
}