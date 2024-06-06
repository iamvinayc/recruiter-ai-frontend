import { Menu, Transition } from "@headlessui/react";
import ArrowLeftIcon from "@heroicons/react/24/outline/ArrowLeftIcon";
import Bars3Icon from "@heroicons/react/24/outline/Bars3Icon";
import ArrowLeftOnRectangleIcon from "@heroicons/react/24/solid/ArrowLeftOnRectangleIcon";
import ChevronDownIcon from "@heroicons/react/24/solid/ChevronDownIcon";
import Cog6ToothIcon from "@heroicons/react/24/solid/Cog6ToothIcon";
import UserCircleIcon from "@heroicons/react/24/solid/UserCircleIcon";
import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";

import { axiosApi } from "@/api/api";
import { ROUTES } from "@/routes/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { BellIcon } from "lucide-react";
import { useLogin } from "../hooks/useLogin";
import { cn } from "../utils";

dayjs.extend(relativeTime);
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
  const { user, logout, isRecruiter } = useLogin();
  const notificationListQuery = useQuery({
    queryKey: ["notificationList"],
    queryFn: async () => {
      return axiosApi({
        url: "notification/",
        method: "GET",
        params: {
          page_size: 5,
        },
      }).then((e) => e.data);
    },
  });

  const readNotificationsMutation = useMutation({
    mutationKey: ["readNotifications"],
    mutationFn: async ({ id }: { id: number }) => {
      return axiosApi({
        url: "notification/:id/".replace(":id", "" + id) as "notification/:id/",
        method: "PUT",
      }).then((e) => e.data);
    },
  });

  const notificationList = (notificationListQuery.data?.data || []).filter(
    (_, i) => i <= 5,
  );
  const unreadCount = notificationListQuery.data?.unread_count || 0;
  return (
    <header className="dark:bg-boxdark sticky top-0 z-[100] flex w-full bg-white drop-shadow-1 dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            aria-controls="sidebar"
            onClick={() => setSidebarOpen((b) => !b)}
            className="dark:bg-boxdark dark:border-strokedark z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm "
          >
            <Bars3Icon className="relative block h-5.5 w-5.5 cursor-pointer" />
          </button>
          <div className="block flex-shrink-0">
            {/* <div className="text-3xl text-black">AI-RECRUIT</div> */}
            <img className="w-[70%]" src="/logo.svg" />
          </div>
        </div>
        <div className="hidden sm:block"></div>
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
                <Menu.Items className="dark:bg-boxdark dark:border-strokedark absolute right-0 mt-4 w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default">
                  <div>
                    <ul className="dark:border-strokedark flex flex-col gap-5 border-b border-stroke px-6 py-7.5">
                      {MenuItems.map(({ Icon, link, title }) => (
                        <Menu.Item key={title}>
                          {({ close }) => (
                            <li>
                              <Link
                                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base uppercase"
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
                      className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base uppercase"
                    >
                      <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                      Log Out
                    </button>
                  </div>
                </Menu.Items>
              </Transition>
            </div>
          </Menu>
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="relative">
                <BellIcon className="h-6 w-6 text-slate-600" />
                <div className="dark:border-gray-900 min-w-6 absolute  right-0 top-0 inline-flex h-6 -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full border-2 border-white bg-red-500 px-2 text-xs font-medium text-white">
                  {unreadCount}
                </div>
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="divide-gray-100 absolute right-0 mt-2 max-h-[70vh] w-56 origin-top-right divide-y overflow-y-scroll rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                <div className="divide-y px-1 py-1">
                  {notificationList.map((e) => (
                    <Menu.Item key={e.id} as="div">
                      {({ active }) => (
                        <div
                          className={`${
                            active
                              ? "bg-violet-500 text-white"
                              : "text-gray-900"
                          } relative w-full cursor-pointer whitespace-pre-wrap break-words rounded-md px-2 py-2 text-sm`}
                          onClick={() => {
                            readNotificationsMutation
                              .mutateAsync({ id: e.id })
                              .then((e) => {
                                if (e.isSuccess) {
                                  notificationListQuery.refetch();
                                } else {
                                  console.log("error", e);
                                }
                              });
                          }}
                        >
                          <div>{e.subject}</div>
                          <div className="flex justify-end">
                            {dayjs(e.created_at).fromNow()}
                          </div>
                          {(
                            isRecruiter ? e.is_user_read : e.is_admin_read
                          ) ? null : (
                            <div className="absolute right-2 top-3 h-1 w-1 rounded-full bg-primary" />
                          )}
                        </div>
                      )}
                    </Menu.Item>
                  ))}
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to={
                          isRecruiter
                            ? ROUTES.RECRUITER.LIST_NOTIFICATION.path
                            : ROUTES.ADMIN.LIST_NOTIFICATION.path
                        }
                      >
                        <button
                          className={`${
                            active
                              ? "bg-violet-500 text-white"
                              : "text-gray-900"
                          } group flex w-full items-center justify-center rounded-md border-t border-slate-200 px-2 py-2 text-sm`}
                        >
                          Show All Notifications
                        </button>
                      </Link>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

interface SideBarProps {
  links: { title: string; link: string; icon: JSX.Element }[];
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
        "dark:bg-boxdark flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear 2xl:static 2xl:translate-x-0 ",
        sidebarOpen ? "translate-x-0" : " hidden -translate-x-full",
        // "absolute left-0 top-0 z-9999 "
      )}
    >
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        {/* <div className="text-3xl text-white">AI-RECRUIT</div> */}
        <img className="w-[80%]" src="/logo.svg" />
        <button
          onClick={() => setSidebarOpen(false)}
          className="block 2xl:hidden"
        >
          <ArrowLeftIcon className="h-6 w-6 text-white" />
        </button>
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
          <div className="gap-y-2 ">
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              MENU
            </h3>

            {links.map(({ link, title, icon }) => (
              <Link to={link} key={title}>
                <div
                  className={cn(
                    "dark:hover:bg-meta-4 dark:bg-meta-4 group relative mb-3 flex items-center gap-2.5 rounded-sm  px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark",
                    pathname == link ? "bg-graydark" : "",
                  )}
                >
                  {icon}
                  {title}
                </div>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};
