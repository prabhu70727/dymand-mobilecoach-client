import uuid from 'uuid'

export const MESSAGES_OLD = [
  {
    _id: uuid.v4(),
    text: 'Vor langer Zeit',
    createdAt: new Date() - 150000,
    type: 'text',
    user: {
      _id: 2
    }
  }
]

export const MESSAGES = [
  {
    _id: uuid.v4(),
    text: 'Lieber Kalorienfreund. Das wird ne spannende Zeit :)',
    createdAt: new Date() - 100000,
    type: 'text',
    user: {
      _id: 2
    }
  },

  {
    _id: uuid.v4(),
    text: 'https://via.placeholder.com/1024x800',
    createdAt: new Date() - 8000,
    user: {
      _id: 2
    },
    image: 'https://via.placeholder.com/1024x800'
  // Any additional custom parameters are passed through
  },

  {
    _id: uuid.v4(),
    text: 'Nun erstmal eine selectOneButton message',
    createdAt: new Date() - 5000,
    type: 'text',
    user: {
      _id: 2
    }
  },

  {
    _id: uuid.v4(),
    text: 'Two buttons',
    createdAt: new Date() - 4000,
    'type': 'selectOneButton',
    'custom': {
      active: true,
      options: [
        {'button': 'Ja, ich strenge mich an', value: 0},
        {'button': 'Nein, ich habe keine Lust', value: 1}
      ]
    },
    user: {
      _id: 2
    }
  }
]

export const MESSAGE_TYPES = [
  // Text message from patient
  {
    text: 'Text vom Patienten',
    type: 'text',
    user: {
      _id: 1
    }
  },

  // Text message from chatbot
  {
    text: 'Text vom Coach',
    type: 'text',
    user: {
      _id: 2
    }
  },

  // SelectOneMessage
  {
    text: 'Select one option message',
    type: 'selectOneButton',
    custom: {
      intention: 'send-answer-message',
      active: true,
      options: [
        {'button': 'Option 1', value: 1},
        {'button': 'Option 2', value: 2}
      ]
    },
    user: {
      _id: 2
    }
  },
  // ImageMessage
  {
    _id: uuid.v4(),
    type: 'image',
    text: 'Image message',
    user: {
      _id: 2
    },
    image: 'https://via.placeholder.com/1024x800'
  // Any additional custom parameters are passed through
  },

  // OpenProgressViewMessage
  {
    text: 'Open Progress Message',
    type: 'openComponent',
    custom: {
      component: 'progress',
      buttonTitle: 'Start Progress'
    },
    user: {
      _id: 2
    }
  },

  // Likert Scale
  {
    text: 'Likert scale',
    type: 'likert',
    custom: [
      {'label': 'Option 1', value: 1},
      {'label': 'Option 2', value: 2},
      {'label': 'Option 3', value: 3},
      {'label': 'Option 4', value: 4},
      {'label': 'Option 5', value: 5},
      {'label': 'Option 6', value: 6},
      {'label': 'Option 7', value: 7}
    ],
    user: {
      _id: 2
    }
  }

  // OpenSelectFoodMessage
  // ShowRichTextMessage
]

export const HTMLMARKUP = '<h1>Rich Content View</h1>' +
        '<p>This is some Rich Content using html markup. The following Elements are supported:</p>' +
        '<h1>h1 (heading1)</h1>' +
        '<h2>h2 (heading2)</h2>' +
        '<h3>h3 (heading3)</h3>' +
        '<p>p (paragraph), <b>b (bold)</b>, <i>i (italic)</i></p>' +
        '<h1>Lists: </h1>' +
        '<p>Only one hierarchical layer. Nesting lists is <b>not</b> supported!</p>' +
        '<p>ul (unordered list): </p>' +
        '<ul><li><b>Bold Listelement 1</b></li><li><i>italic Listelement 2</b></li><li>regular Listelement 3</li></ul>' +
        '<p>ol (ordered list): </p>' +
        '<ol><li>Listelement 1</li><li>Listelement 2</li><li>Listelement 3</li></ol>' +
        '<h1>Tables:</h1>' +
        '<p>Tables are currently <b>not supported!</b></p>' +
        '<h1>Images:</h1>' +
        '<img src="food_pyramid" />'
