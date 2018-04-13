import Brand from './Brand'
// leave off @2x/@3x
// Use thrifty, these images are held in memory (require)!
const images = {
  appLogo: Brand.images.logo,
  poweredByLogo: Brand.images.poweredBy,
  coaches: [
    require('../Images/Coaches/coach_male.png'),
    require('../Images/Coaches/coach_female.png')
  ],
  chatBg: Brand.images.chatBackground,
  custom: {
    pyramidBg: require('../Images/FoodPyramid/pyramid_bg.png'),
    pyramidFood: require('../Images/FoodPyramid/pyramid_food.png')
  }
}

export default images
