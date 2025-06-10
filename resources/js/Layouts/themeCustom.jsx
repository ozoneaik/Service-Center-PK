import {alpha, createTheme, getContrastRatio} from "@mui/material";

const violetBase = '#7F00FF';
const violetMain = alpha(violetBase, 0.7);

const PumpkinColorBase = '#f15922';
const PumpkinColorMain = alpha(PumpkinColorBase, 0.7);

const CardFormRpColorBase = '#d9d9d9';
const CardFormRpColorMain = alpha(CardFormRpColorBase, 0.7);


export const Theme = createTheme({
    palette: {
        violet: {
            main: violetMain,
            light: alpha(violetBase, 0.5),
            dark: alpha(violetBase, 0.9),
            contrastText: getContrastRatio(violetMain, '#fff') > 4.5 ? '#fff' : '#111',
        },
        pumpkinColor : {
            main: PumpkinColorBase,
            light: alpha(PumpkinColorBase, 0.5),
            dark: alpha(PumpkinColorBase, 0.9),
            contrastText: getContrastRatio(PumpkinColorMain, '#fff') > 4.5 ? '#fff' : '#111',
        },
        cardFormRpColor : {
            main: CardFormRpColorBase,
            light: alpha(CardFormRpColorBase, 0.5),
            dark: alpha(CardFormRpColorBase, 0.9),
            contrastText: getContrastRatio(CardFormRpColorMain, '#fff') > 4.5 ? '#fff' : '#111',
        }
    },
});
