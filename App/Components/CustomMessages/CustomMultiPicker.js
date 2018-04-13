// based on https://github.com/ataomega/react-native-multiple-select-list
import React, {Component} from 'react'
import {
  Text,
  View,
  TouchableOpacity
} from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons'

export default class CustomMultiPicker extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selected: []
    }
  }

  componentDidMount = () => {
    const selected = this.props.selected
    if (typeof selected === 'object') {
      selected.map(select => {
        this._onSelect(select)
      })
    } else {
      this._onSelect(selected)
    }
  }

  _onSelect = (item, options) => {
    let selectedItems = this.state.selected
    // check if already included
    if (!selectedItems.includes(item)) selectedItems.push(item)
    // remove if already included
    else selectedItems = selectedItems.filter((currentItem) => currentItem !== item)

    this.setState(
      {selected: selectedItems}
    )

    // gather selected in result
    let result = []
    options.forEach((option, index) => {
      if (selectedItems.includes(index)) result.push(option)
      else result.push('')
    })
    this.props.callback(result)
    // const selected = this.state.selected
    // if (this.props.multiple) {
    //   if (selected.indexOf(item) === -1) {
    //     selected.push(item)
    //     this.setState({
    //       selected: selected
    //     })
    //   } else {
    //     selected = selected.filter(i => i !== item)
    //     this.setState({
    //       selected: selected
    //     })
    //   }
    // } else {
    //   if (selected.indexOf(item) === -1) {
    //     selected = [item]
    //     this.setState({
    //       selected: selected
    //     })
    //   } else {
    //     selected = []
    //     this.setState({
    //       selected: selected
    //     })
    //   }
    // }
    // this.props.callback(selected)
  }

  _isSelected = (itemKey) => {
    return this.state.selected.includes(itemKey)
    // const selected = this.state.selected
    // if (selected.indexOf(item) === -1) {
    //   return false
    // }
    // return true
  }

  render () {
    const { options } = this.props
    // const labels = Object.keys(options).map(i => options[i])
    // const values = Object.keys(options)
    return (
      <View>
        {options.map((option, index) => {
          let itemKey = index
          // if (returnValue === 'value') {
          //   itemKey = values[index]
          // } else if (returnValue === 'index') {
          //   itemKey = index
          return (
            <TouchableOpacity
              key={Math.round(Math.random() * 1000000)}
              disabled={this.props.disabled}
              style={[{
                opacity: this.props.disabled ? 0.5 : 1,
                padding: 7,
                marginTop: 0,
                marginLeft: 2,
                marginRight: 2,
                marginBottom: 6,
                backgroundColor: this.props.rowBackgroundColor,
                // height: this.props.rowHeight,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: this.props.rowRadius,
                borderColor: this.props.borderColor,
                borderWidth: 1
              },
                this.props.itemStyle
              ]}
              onPress={() => {
                this._onSelect(itemKey, options)
              }}
              >
              <View style={{flexShrink: 1}}><Text style={{color: this.props.labelColor}}>{option.label}</Text></View>
              {
                this._isSelected(itemKey)
                ? <Icon name={this.props.selectedIconName}
                  style={[{color: this.props.iconColor, fontSize: this.props.iconSize}, this.props.selectedIconStyle]}
                      />
                : <Icon name={this.props.unselectedIconName}
                  style={[{color: this.props.iconColor, fontSize: this.props.iconSize}, this.props.unselectedIconStyle]}
                      />
              }
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }
}
