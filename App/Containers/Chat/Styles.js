import { StyleSheet } from 'react-native'

import { Colors } from '../../Themes/'

export default StyleSheet.create({
  chatContainer: {
    backgroundColor: Colors.main.chatBackground,
    flex: 1
  },
  footerContainer: {
    paddingBottom: 85,
    paddingRight: 8
  },
  coachImage: {
    position: 'absolute',
    width: 53, // 127 / 2,
    height: 53, // 121 / 2,
    top: -30,
    resizeMode: 'contain'
  }

})

export const TextBubbleStyle = {
  wrapperStyle: {
    left: {
      backgroundColor: Colors.messageBubbles.left.background
    },
    right: {
      backgroundColor: Colors.messageBubbles.right.background
    }
  },
  textStyle: {
    left: {
      color: Colors.messageBubbles.left.text
    },
    right: {
      color: Colors.messageBubbles.right.text
    },
    link: {
      color: Colors.main.hyperlink
    }
  }
}
