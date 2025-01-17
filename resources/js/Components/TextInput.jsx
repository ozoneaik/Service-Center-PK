import { forwardRef, useEffect, useRef } from 'react';

export default forwardRef(function TextInput({ type = 'text', className = '', isFocused = false, ...props }, ref) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    return (
        <input
            {...props}
            type={type}
            className={
                'inputborder-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md shadow-sm' +
                className
            }
            ref={input}
        />
    );
});
