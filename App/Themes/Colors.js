// https://coolors.co/50514f-f25f5c-ffe066-247ba0-70c1b3
// https://coolors.co/e63946-f1faee-a8dadc-457b9d-1d3557
import Brand from './Brand'

const button = {
  background: Brand.colors.buttonBackground,
  text: Brand.colors.buttonText,
  disabled: '#E2E2E2',
  submit: Brand.colors.buttonText,
  cancel: '#E2E2E2',
  placeholder: '#E2E2E2'
}

const colors = {
  brand: Brand,
  main: {
    appBackground: Brand.colors.grey3,
    chatBackground: Brand.colors.backgroundMain,
    headline: Brand.colors.textMain,
    paragraph: Brand.colors.textMain,
    hyperlink: Brand.colors.buttonBackground,
    loadingContainer: Brand.colors.primary,
    primary: Brand.colors.primary,
    grey1: Brand.colors.grey1,
    grey2: Brand.colors.grey2,
    grey3: Brand.colors.grey3
  },
  onboarding: {
    background: Brand.colors.primary,
    text: Brand.colors.text2
  },
  navigationBar: {
    background: Brand.colors.primary,
    text: Brand.colors.primaryText
  },
  sideMenu: {
    background: Brand.colors.backgroundMain,
    buttonBackground: Brand.colors.backgroundMain,
    text: Brand.colors.textMain
  },
  messageBubbles: {
    left: {
      background: Brand.colors.background1,
      text: Brand.colors.text1
    },
    right: {
      background: Brand.colors.background2,
      text: Brand.colors.text2
    },
    system: {
      background: '#B5B5B5',
      text: '#fff'
    },
    ticks: {
      unread: Brand.colors.text2,
      read: Brand.colors.buttonBackground
    }
  },
  buttons: {
    common: {
      ...button
    },
    selectOne: {
      ...button
    },
    likert: {
      ...button
    },
    likertSlider: {
      ...button,
      thumb: button.text, // slider handle
      minTint: Brand.colors.primary, // slider background left
      maxTint: button.disabled // slider background right
    },
    openComponent: {
      ...button
    },
    selectMany: {
      submitButton: {
        ...button
      },
      items: {
        background: Brand.colors.backgroundMain,
        text: Brand.colors.textMain,
        border: Brand.colors.background1
      }
    },
    freeNumbers: {
      ...button,
      selection: Brand.colors.text2
    },
    freeText: {
      ...button,
      selection: Brand.colors.text2
    },
    datePicker: {
      ...button
    },
    actionButton: {
      ...button,
      items: {
        text: Brand.colors.textMain,
        background: Brand.colors.backgroundMain
      }
    }
  },
  modal: {
    headerBackground: Brand.colors.background1,
    headerText: Brand.colors.text1,
    background: Brand.colors.backgroundMain,
    text: Brand.colors.textMain
  },
  toast: {
    text: Brand.colors.primary,
    background: Brand.colors.primaryText
  },
  connectionIndicator: {
    neutralState: '#FFFFFF',
    intermediateState: '#fda428',
    successState: '#33A02C'
  },
  modules: {
    tour: {
      background: Brand.colors.background2
    },
    backpack: {
      background: Brand.colors.background2,
      text: Brand.colors.text2
    },
    recipes: {
      background: Brand.colors.background2,
      text: Brand.colors.text2
    },
    foodDiary: {
      items: {
        background: Brand.colors.background1,
        backgroundActive: Brand.colors.background1,
        text: Brand.colors.grey2,
        textActive: Brand.colors.background2,
        border: '#fff'
      },
      tabs: {
        background: Brand.colors.grey3,
        indicator: Brand.colors.primary,
        text: Brand.colors.primary
      }
    }
  }
}

export default colors
