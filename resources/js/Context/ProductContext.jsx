import {createContext, useContext, useState} from "react";

const ProductTargetContent = createContext({
    productTarget : false,
    setProductTarget : ()=> {}
})

export const ProductTargetProvider = ({children}) => {
    const [productTarget, _setProductTarget] = useState(
        JSON.parse(localStorage.getItem('productTarget')) || false
    );

    const setProductTarget = (productTarget) => {
        if (productTarget){
            localStorage.setItem('productTarget', JSON.stringify(productTarget));
        }else{
            localStorage.removeItem('productTarget');
        }
        _setProductTarget(productTarget);
    }

    return (
        <ProductTargetContent.Provider value={{productTarget, setProductTarget}}>
            {children}
        </ProductTargetContent.Provider>
    )
}

export const useProductTarget = () => {
    return useContext(ProductTargetContent)
}
