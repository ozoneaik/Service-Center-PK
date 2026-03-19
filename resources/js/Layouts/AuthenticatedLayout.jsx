import Dropdown from "@/Components/Dropdown";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { router, usePage } from "@inertiajs/react";
import React, { useState } from "react";
import icon from "../assets/images/logo.png";
import { Avatar, Button, Fab, Typography } from "@mui/material";
import watermark from "../assets/images/coverMini.jpg";
import HeaderImage from "../assets/images/cover.png";
import NavBar from "@/Layouts/NavBar.jsx";
import {
    ArrowDownward,
    ArrowUpward,
    Menu,
    MessageOutlined,
} from "@mui/icons-material";

const HeaderImageStyle = {
    backgroundImage: `url(${HeaderImage})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% auto",
    backgroundPosition: "top",
};

const WatermarkStyle = {
    backgroundImage: `url(${watermark})`,
    backgroundRepeat: "repeat",
    backgroundSize: "300px auto",
    backgroundPosition: "center",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
    pointerEvents: "none",
    // opacity: 0.1,
};

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const access_menu = usePage().props.auth.access_menu;
    const groupedMenu = {};
    access_menu.forEach((item) => {
        if (item.main_menu) {
            groupedMenu[item.group] = {
                name: item.menu_name,
                routerUrl: item.redirect_route || null,
                childs: [],
            };
        }
    });
    access_menu.forEach((item) => {
        if (!item.main_menu && groupedMenu[item.group]) {
            groupedMenu[item.group].childs.push({
                name: item.menu_name,
                routerUrl: item.redirect_route || null,
            });
        }
    });
    const formatedMenu = Object.values(groupedMenu);
    

    return (
        <div className="min-h-screen relative" style={HeaderImageStyle}>
            <div style={WatermarkStyle}></div>
            <nav className="fixed w-full z-50 border-b border-gray-100 bg-orange/75 backdrop-blur-sm">
                <div className="px-3 bg-black/75">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div
                                onClick={() => router.get(route("dashboard"))}
                                className="flex shrink-0 items-center gap-2 text-white font-bold cursor-pointer"
                            >
                                <Avatar src={icon || ""} />
                                <Typography>บริการศูนย์ซ่อม</Typography>
                            </div>
                            <div className="hidden space-x-2 lg:-my-px lg:ms-5 lg:flex">
                                <NavBar user={user} accessMenu={formatedMenu} />
                            </div>
                        </div>
                        <div className="hidden lg:ms-6 lg:flex lg:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="primary"
                                            endIcon={<Menu />}
                                        >
                                            <Avatar
                                                sx={{
                                                    color: "gray",
                                                    width: 28,
                                                    height: 28,
                                                    bgcolor: "white",
                                                }}
                                            >
                                                {user.name.split("", 1)}
                                            </Avatar>
                                        </Button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route("profile.edit")}
                                        >
                                            ข้อมูลส่วนตัว
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                        >
                                            ออกจากระบบ
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                        <div className="-me-2 flex items-center lg:hidden">
                            <Button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                variant={
                                    !showingNavigationDropdown
                                        ? "contained"
                                        : "outlined"
                                }
                                color="primary"
                                startIcon={
                                    showingNavigationDropdown ? (
                                        <ArrowUpward />
                                    ) : (
                                        <ArrowDownward />
                                    )
                                }
                            >
                                ดูเมนู
                            </Button>
                        </div>
                    </div>
                </div>

                {/* <div
                    style={{
                        backgroundColor: "#404040",
                        color: "#fff",
                        maxHeight: "80dvh",
                        overflow: "auto",
                    }}
                    className={
                        (showingNavigationDropdown ? "block" : "hidden") +
                        " lg:hidden"
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        {access_menu.map((item, index) => {
                            if (item.redirect_route === null) {
                                return (
                                    <React.Fragment
                                        key={index}
                                    ></React.Fragment>
                                );
                            } else {
                                return (
                                    <React.Fragment key={index}>
                                        <ResponsiveNavLink
                                            href={route(item.redirect_route, {
                                                is_code_cust_id:
                                                    user.is_code_cust_id,
                                            })}
                                            active={route().current(
                                                item.redirect_route,
                                            )}
                                        >
                                            {item.menu_name}
                                        </ResponsiveNavLink>
                                    </React.Fragment>
                                );
                            }
                        })}
                        {user.role === "admin" && (
                            <ResponsiveNavLink href={route("admin.show")}>
                                ผู้ดูแลระบบ
                            </ResponsiveNavLink>
                        )}
                    </div>
                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="mt-3 space-y-1">
                            <div className="px-4">
                                <div className="text-base font-medium text-gray-500">
                                    {user.name}
                                </div>
                                <div className="text-sm font-medium text-gray-500">
                                    {user.email}
                                </div>
                            </div>
                            <ResponsiveNavLink
                                method="post"
                                href={route("logout")}
                                as="button"
                            >
                                <span style={{ color: "red" }}>ออกจากระบบ</span>
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div> */}

                <div
                    style={{
                        backgroundColor: "#404040",
                        color: "#fff",
                        maxHeight: "80dvh",
                        overflow: "auto",
                    }}
                    className={
                        (showingNavigationDropdown ? "block" : "hidden") +
                        " lg:hidden shadow-inner"
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        {formatedMenu.map((menuGroup, index) => (
                            <React.Fragment key={index}>
                                {/* 1. แสดงชื่อเมนูหลัก / หัวข้อ */}
                                {menuGroup.routerUrl ? (
                                    <ResponsiveNavLink
                                        href={route(menuGroup.routerUrl, {
                                            is_code_cust_id:
                                                user.is_code_cust_id,
                                        })}
                                        active={route().current(
                                            menuGroup.routerUrl,
                                        )}
                                        className="text-gray-200 hover:text-orange-400 hover:bg-gray-700 font-medium transition-colors"
                                    >
                                        {menuGroup.name}
                                    </ResponsiveNavLink>
                                ) : (
                                    <div className="px-4 py-2 mt-2 text-sm font-bold text-orange-400 bg-gray-900/50 border-l-4 border-orange-500">
                                        {menuGroup.name}
                                    </div>
                                )}

                                {/* 2. แสดงเมนูย่อย (เพิ่มจุดลูกน้ำด้านหน้าและเอฟเฟกต์ตอนกด) */}
                                {menuGroup.childs.map((child, childIndex) => (
                                    <ResponsiveNavLink
                                        key={`child-${index}-${childIndex}`}
                                        href={route(child.routerUrl, {
                                            is_code_cust_id:
                                                user.is_code_cust_id,
                                        })}
                                        active={route().current(
                                            child.routerUrl,
                                        )}
                                        className="pl-8 text-gray-300 hover:text-orange-400 hover:bg-gray-700 text-sm transition-colors"
                                    >
                                        <span className="mr-2 text-orange-500/50">
                                            •
                                        </span>{" "}
                                        {child.name}
                                    </ResponsiveNavLink>
                                ))}
                            </React.Fragment>
                        ))}

                        {/* เมนูสำหรับ Admin */}
                        {user.role === "admin" && (
                            <React.Fragment>
                                <div className="px-4 py-2 mt-2 text-sm font-bold text-orange-400 bg-gray-900/50 border-l-4 border-orange-500">
                                    ผู้ดูแลระบบ
                                </div>
                                <ResponsiveNavLink
                                    href={route("admin.show")}
                                    className="pl-8 text-gray-300 hover:text-orange-400 hover:bg-gray-700 text-sm transition-colors"
                                >
                                    <span className="mr-2 text-orange-500/50">
                                        •
                                    </span>{" "}
                                    จัดการข้อมูลผู้ดูแลระบบ
                                </ResponsiveNavLink>
                            </React.Fragment>
                        )}
                    </div>

                    {/* ส่วนข้อมูล User ด้านล่าง */}
                    <div className="border-t border-gray-600 pb-2 pt-4 bg-gray-900/30">
                        <div className="mt-3 space-y-1">
                            <div className="px-4 mb-3">
                                <div className="text-base font-semibold text-white">
                                    {user.name}
                                </div>
                                <div className="text-sm font-medium text-gray-400">
                                    {user.email}
                                </div>
                            </div>
                            <ResponsiveNavLink
                                method="post"
                                href={route("logout")}
                                as="button"
                                className="hover:bg-red-900/20 transition-colors"
                            >
                                <span className="text-red-400 font-medium">
                                    ออกจากระบบ
                                </span>
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow pt-16">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}
            <main className="pt-16">{children}</main>
        </div>
    );
}
