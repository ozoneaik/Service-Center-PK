import NavLink from "@/Components/NavLink.jsx";
import {Button, Menu, MenuItem} from "@mui/material";
import React, {useState} from "react";
import {Link} from "@inertiajs/react";
import {getMenuHeadersAdmin} from "@/Layouts/menuHeader.js";



export default function NavBar({user,accessMenu}) {
    const [anchorEls, setAnchorEls] = useState({});

    const adminMenu = getMenuHeadersAdmin(user)
    const handleClick = (index) => (event) => {
        setAnchorEls((prev) => ({...prev, [index]: event.currentTarget}));
    };

    const handleClose = (index) => () => {
        setAnchorEls((prev) => ({...prev, [index]: null}));
    };

    const renderMenuItem = (menu, index) => {
        if (menu.childs && menu.childs.length > 0) {
            const open = Boolean(anchorEls[index]);
            return (
                <div key={index} className="inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5">
                    <Button
                        sx={{color: '#6b7280'}}
                        aria-controls={open ? `menu-${index}` : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick(index)}
                    >
                        {menu.name}
                    </Button>
                    <Menu
                        id={`menu-${index}`}
                        anchorEl={anchorEls[index]}
                        open={open}
                        onClose={handleClose(index)}
                        MenuListProps={{
                            'aria-labelledby': `menu-button-${index}`,
                        }}
                    >
                        {menu.childs.map((child, childIndex) => (
                            <MenuItem
                                key={childIndex}
                                component={Link}
                                href={route(child.routerUrl, {is_code_cust_id : user.is_code_cust_id})}
                                onClick={handleClose(index)}
                            >
                                {child.name}
                            </MenuItem>
                        ))}
                    </Menu>
                </div>
            );
        }

        return (
            <NavLink
                key={index}
                href={route(menu.routerUrl)}
                active={route().current(menu.routerUrl)}
                target={menu.target || '_self'}
            >
                {menu.name}
            </NavLink>
        );
    };

    return (
        <>
            {accessMenu.map((menu, index) => renderMenuItem(menu, index))}
            {adminMenu.map((menu, index) => renderMenuItem(menu, index))}
        </>
    );
}
