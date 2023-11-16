import { Disclosure, Menu, Transition } from "@headlessui/react";
import ArrowLeftIcon from "@heroicons/react/24/outline/ArrowLeftIcon";
import Bars3Icon from "@heroicons/react/24/outline/Bars3Icon";
import ChevronUpIcon from "@heroicons/react/24/outline/ChevronUpIcon";
import Squares2X2Icon from "@heroicons/react/24/outline/Squares2X2Icon";
import ArrowLeftOnRectangleIcon from "@heroicons/react/24/solid/ArrowLeftOnRectangleIcon";
import ChevronDownIcon from "@heroicons/react/24/solid/ChevronDownIcon";
import Cog6ToothIcon from "@heroicons/react/24/solid/Cog6ToothIcon";
import UserCircleIcon from "@heroicons/react/24/solid/UserCircleIcon";
import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";

import { useLogin } from "../hooks/useLogin";
import { cn } from "../utils";

const MenuItems = [
  {
    Icon: <UserCircleIcon className="h-6 w-6" />,
    title: "My Profile",
    link: "#",
  },
  {
    Icon: (
      <svg
        className="h-6 w-6 fill-current"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.6687 1.44374C17.1187 0.893744 16.4312 0.618744 15.675 0.618744H7.42498C6.25623 0.618744 5.25935 1.58124 5.25935 2.78437V4.12499H4.29685C3.88435 4.12499 3.50623 4.46874 3.50623 4.91562C3.50623 5.36249 3.84998 5.70624 4.29685 5.70624H5.25935V10.2781H4.29685C3.88435 10.2781 3.50623 10.6219 3.50623 11.0687C3.50623 11.4812 3.84998 11.8594 4.29685 11.8594H5.25935V16.4312H4.29685C3.88435 16.4312 3.50623 16.775 3.50623 17.2219C3.50623 17.6687 3.84998 18.0125 4.29685 18.0125H5.25935V19.25C5.25935 20.4187 6.22185 21.4156 7.42498 21.4156H15.675C17.2218 21.4156 18.4937 20.1437 18.5281 18.5969V3.47187C18.4937 2.68124 18.2187 1.95937 17.6687 1.44374ZM16.9469 18.5625C16.9469 19.2844 16.3625 19.8344 15.6406 19.8344H7.3906C7.04685 19.8344 6.77185 19.5594 6.77185 19.2156V17.875H8.6281C9.0406 17.875 9.41873 17.5312 9.41873 17.0844C9.41873 16.6375 9.07498 16.2937 8.6281 16.2937H6.77185V11.7906H8.6281C9.0406 11.7906 9.41873 11.4469 9.41873 11C9.41873 10.5875 9.07498 10.2094 8.6281 10.2094H6.77185V5.63749H8.6281C9.0406 5.63749 9.41873 5.29374 9.41873 4.84687C9.41873 4.39999 9.07498 4.05624 8.6281 4.05624H6.77185V2.74999C6.77185 2.40624 7.04685 2.13124 7.3906 2.13124H15.6406C15.9844 2.13124 16.2937 2.26874 16.5687 2.50937C16.8094 2.74999 16.9469 3.09374 16.9469 3.43749V18.5625Z"
          fill=""
        ></path>
      </svg>
    ),
    title: "My Contacts",
    link: "#",
  },
  {
    Icon: <Cog6ToothIcon className="h-6 w-6" />,
    title: "Account Settings",
    link: "#",
  },
];
export const Header = ({
  setSidebarOpen,
}: {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { user, logout } = useLogin();

  return (
    <header className="dark:bg-boxdark sticky top-0 z-1 flex w-full bg-white drop-shadow-1 dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={() => setSidebarOpen((b) => !b)}
            className="dark:bg-boxdark z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark lg:hidden"
          >
            <Bars3Icon className="relative block h-5.5 w-5.5 cursor-pointer" />
          </button>
          <div className="block flex-shrink-0 lg:hidden">
            <div className="text-3xl text-black">AI-RECRUIT</div>
          </div>
        </div>
        <div className="hidden sm:block">
          <form action="https://formbold.com/s/unique_form_id" method="POST">
            <div className="relative">
              <button className="absolute left-0 top-1/2 -translate-y-1/2">
                <svg
                  className="dark:fill-bodydark fill-body hover:fill-primary dark:hover:fill-primary"
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                    fill=""
                  />
                </svg>
              </button>
              <input
                placeholder="Type to search..."
                className="w-full bg-transparent pl-9 pr-4 font-medium focus:outline-none xl:w-125"
                type="text"
              />
            </div>
          </form>
        </div>
        <div className="2xsm:gap-7 flex items-center gap-3">
          <Menu>
            <div className="relative">
              <Menu.Button>
                <div className="flex items-center gap-4">
                  <span className="hidden text-right lg:block">
                    <span className="block text-sm font-medium text-black dark:text-white">
                      {user?.first_name} {user?.last_name}
                    </span>
                    <span className="block text-xs">{user?.email}</span>
                  </span>
                  <span className="h-12 w-12 rounded-full">
                    <UserCircleIcon className="h-12 w-12  text-slate-600" />
                  </span>
                  <ChevronDownIcon className="h-5 w-5  text-slate-700" />
                </div>
              </Menu.Button>
              {/* drop down */}
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="dark:bg-boxdark absolute right-0 mt-4 w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark">
                  <div>
                    <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
                      {MenuItems.map(({ Icon, link, title }) => (
                        <Menu.Item key={title}>
                          {({ close }) => (
                            <li>
                              <Link
                                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                                to={link}
                                onClick={() => close()}
                              >
                                {Icon}

                                {title}
                              </Link>
                            </li>
                          )}
                        </Menu.Item>
                      ))}
                    </ul>
                    <button
                      onClick={logout}
                      type="button"
                      className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                    >
                      <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                      Log Out
                    </button>
                  </div>
                </Menu.Items>
              </Transition>
            </div>
          </Menu>
        </div>
      </div>
    </header>
  );
};

interface SideBarProps {
  links: { title: string; link: string }[];
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarOpen: boolean;
}

export const SideBar = ({
  setSidebarOpen,
  sidebarOpen,
  links,
}: SideBarProps) => {
  const { pathname } = useLocation();

  return (
    <aside
      className={cn(
        "dark:bg-boxdark absolute left-0 top-0 z-9999 flex h-screen w-72.5 -translate-x-full flex-col overflow-y-hidden bg-black duration-300 ease-linear lg:static lg:translate-x-0 ",
        !sidebarOpen ? "-translate-x-full" : "translate-x-0",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <div className="text-3xl text-white">AI-RECRUIT</div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="block lg:hidden"
        >
          <ArrowLeftIcon className="h-6 w-6" />
          {/* <svg
            className="fill-current"
            width={20}
            height={18}
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg> */}
        </button>
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              MENU
            </h3>

            <Disclosure defaultOpen>
              {({ open }) => (
                <ul className="mb-6 flex flex-col gap-1.5">
                  <Disclosure.Button>
                    <div className="dark:hover:bg-meta-4 dark:bg-meta-4 group relative flex items-center gap-2.5 rounded-sm bg-graydark px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark">
                      <Squares2X2Icon className="h-5 w-5" />
                      Dashboard
                      {open ? (
                        <ChevronUpIcon className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 rotate-180   stroke-white" />
                      ) : (
                        <ChevronDownIcon className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 rotate-180   stroke-white" />
                      )}
                    </div>
                  </Disclosure.Button>
                  <Disclosure.Panel>
                    <li>
                      <div className="translate false transform overflow-hidden">
                        <ul className="mb-5.5 mt-4 flex flex-col gap-2.5 pl-6">
                          {links.map(({ link, title }) => (
                            <li key={link}>
                              <Link
                                className={cn(
                                  " group relative flex items-center gap-2.5 rounded-md px-4 font-medium  duration-300 ease-in-out hover:text-white",
                                  pathname == link
                                    ? "text-white"
                                    : "text-bodydark2",
                                )}
                                to={link}
                              >
                                {title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  </Disclosure.Panel>
                </ul>
              )}
            </Disclosure>
          </div>
        </nav>
      </div>
    </aside>
  );
};
