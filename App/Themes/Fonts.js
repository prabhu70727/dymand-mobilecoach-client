const type = {
  family: 'Roboto',
  base: 'Roboto Regular',
  bold: 'Roboto Bold',
  italic: 'Roboto Italic',
  boldItalic: 'Roboto Bold Italic'
}

const size = {
  h1: 38,
  h2: 34,
  h3: 30,
  h4: 26,
  h5: 20,
  h6: 19,
  input: 18,
  regular: 17,
  medium: 14,
  small: 12,
  tiny: 8.5
}

const style = {
  h1: {
    fontFamily: type.bold,
    fontSize: size.h1
  },
  h2: {
    fontWeight: type.bold,
    fontSize: size.h2
  },
  h3: {
    fontFamily: type.bold,
    fontSize: size.h3
  },
  h4: {
    fontFamily: type.bold,
    fontSize: size.h4
  },
  h5: {
    fontFamily: type.bold,
    fontSize: size.h5
  },
  h6: {
    fontFamily: type.bold,
    fontSize: size.h6
  },
  p: {
    fontFamily: type.base,
    fontSize: size.regular
  },
  normal: {
    fontFamily: type.base,
    fontSize: size.regular
  },
  description: {
    fontFamily: type.base,
    fontSize: size.medium
  },
  italic: {
    fontFamily: type.italic
  },
  bold: {
    fontFamily: type.Bold
  }
}

export default {
  type,
  size,
  style
}
