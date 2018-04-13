import React, { Component } from 'react'
import { StyleSheet, Text } from 'react-native'
import HTMLView from 'react-native-htmlview'
import colors from '../Themes/Colors'
import fonts from '../Themes/Fonts'
import FitImage from 'react-native-fit-image'

export default class NativeRichContent extends Component {
  render () {
    return (
      <HTMLView
        value={this.props.children}
        stylesheet={styles}
        addLineBreaks={false}
        renderNode={renderLiTest}
        />
    )
  }
}

function renderLiTest (node, index, siblings, parent, defaultRenderer) {
  // LIST-ELEMENTS
  let listItemPrefix = null
  let listItemSuffix = null

  if (node.name === 'li') {
  // First check for Bullet / Numbered Formats

    //  if (parent) {}
    // Ordered List
    if (parent.name === 'ol') {
      listItemPrefix = {
        data: index + 1 + '. ',
        type: 'text',
        parent: node
      }
    } else if (parent.name === 'ul') {
    // Unordered List
      listItemPrefix = {
        data: '\u2022 ',
        type: 'text',
        parent: node
      }
    }

    // lineBreak
    listItemSuffix = {
      data: '\n',
      type: 'text',
      parent: node
    }

    let children = node.children

    // Add Prefix (Bullet) as First Child of LI-Element
    children.unshift(listItemPrefix)

    // Add Suffix as Last Child of LI-Element
    let isLast = true
    if (node.next) {
      if (node.next.name === 'li') isLast = false
    }

    if (!isLast) children.push(listItemSuffix)

    // Render Text with default renderer
    return (
      <Text key={index}>
        {defaultRenderer(children, node)}
      </Text>
    )
  }

  // IMAGE-ELEMENTS
  if (node.name === 'img') {
    return (
      <FitImage key={index} style={styles.img} source={{uri: node.attribs.src}} />
    )
  }
}

// ATTENTION: DONT USE CAPITAL LETTERS IN STYLE CLASS NAMES FOR THE HTML STUFF
const styles = StyleSheet.create({
  h1: {...fonts.style.h4,
    marginTop: 20,
    marginBottom: 10
  },
  h2: {...fonts.style.h5,
    marginTop: 15,
    marginBottom: 10
  },
  h3: {...fonts.style.h6,
    color: colors.main.paragraph,
    marginTop: 10,
    marginBottom: 10
  },
  b: {
    fontWeight: 'bold'
  },
  i: {
    ...fonts.style.italic
  },
  p: {...fonts.style.p,
    color: colors.main.paragraph,
    marginTop: 5,
    marginBottom: 5
  },
  ul: {
    marginLeft: 5,
    paddingLeft: 5,
    lineHeight: 25,
    marginBottom: 5,
    marginTop: 5
  },
  ol: {
    marginLeft: 5,
    paddingLeft: 5,
    lineHeight: 25,
    marginBottom: 5,
    marginTop: 5
  },
  li: {...fonts.style.p,
    color: colors.main.paragraph
  },
  img: {
    marginTop: 10,
    marginBottom: 10
  }
})
