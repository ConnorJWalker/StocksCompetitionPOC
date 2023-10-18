import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '../../icons/delete-icon'
import EditIcon from '../../icons/edit-icon'

interface props {
    onDeleteClick: () => Promise<void>
    onEditClick: () => void
}

const CommentMenu = ({ onDeleteClick, onEditClick }: props) => {
    const [menuVisible, setMenuVisible] = useState(false)

    const hamburgerRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLUListElement>(null)

    const buttonClick = async (callback: () => (Promise<void> | void)) => {
        await callback()
        setMenuVisible(false)
    }

    const handleOutsideClick = (e: MouseEvent) => {
        const outsideHamburger = hamburgerRef.current && !hamburgerRef.current.contains(e.target as Node)
        const outsideDropdown = dropdownRef.current && !dropdownRef.current.contains(e.target as Node)

        if (outsideHamburger && outsideDropdown) {
            setMenuVisible(false)
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick)
        return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [])

    return (
        <div className='comment-menu'>
            <div ref={hamburgerRef} className='hamburger' onClick={() => setMenuVisible(!menuVisible)}>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <ul ref={dropdownRef} className='comment-menu-options'
                style={{
                    display: menuVisible ? 'block' : 'none',
                    top: hamburgerRef.current?.getBoundingClientRect().bottom + 'px',
                    right: window.innerWidth - (hamburgerRef.current?.getBoundingClientRect().right || 0) + 'px'
                }}>
                <li onClick={() => buttonClick(onEditClick)}>
                    <EditIcon /> Edit
                </li>
                <li style={{ color: 'var(--danger)' }} onClick={() => buttonClick(onDeleteClick)}>
                    <DeleteIcon /> Delete
                </li>
            </ul>
        </div>
    )
}

export default CommentMenu
