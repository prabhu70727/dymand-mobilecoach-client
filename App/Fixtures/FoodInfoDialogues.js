
const FoodInfoDialogues = [
  {
    title: 'Ausblick, Einführung LMP',
    messages: [
      {
        'id': 0,
        'last-modified': 1502352173027,
        'server-message': 'Bevor wir uns Deine erfassten Lebensmittel genauer anschauen, machen wir uns heute auf den Weg die Lebensmittelpyramide der Schweizer Gesellschaft für Ernährung zusammen anzuschauen.',
        'server-timestamp': 1502352173027,
        'status': 'SENT_BY_SYSTEM',
        'expects-answer': false,
        'type': 'PLAIN',
        'next': '1'
      },
      {
        'id': 1,
        'last-modified': 1502352173027,
        'server-message': 'Kennst Du die Lebensmittelpyramide eigentlich schon?',
        'server-timestamp': 1502352173027,
        'status': 'SENT_BY_SYSTEM',
        'expects-answer': true,
        'answer-format': { 'type': 'select-one',
          'options': [
            {text: 'Ja klar', value: 2},
            {text: 'Nein, noch nicht', value: 3}
          ]
        },
        'type': 'PLAIN'
      },
      {
        'id': 2,
        'last-modified': 1502352173027,
        'server-message': 'Super. Ein wenig Auffrischung schadet sicher nicht ☺',
        'server-timestamp': 1502352173027,
        'status': 'SENT_BY_SYSTEM',
        'expects-answer': false,
        'type': 'PLAIN',
        'next': '4'
      },
      {
        'id': 3,
        'last-modified': 1502352173027,
        'server-message': 'Das macht gar nichts. Los gehts:',
        'server-timestamp': 1502352173027,
        'status': 'SENT_BY_SYSTEM',
        'expects-answer': false,
        'type': 'PLAIN',
        'next': '4'
      },
      {
        'id': 4,
        'last-modified': 1502352173027,
        'server-message': 'Die Schweizer Lebensmittelpyramide veranschaulicht bildlich eine ausgewogene Ernährung. So sieht sie aus ...',
        'message-timestamp': 1502352173027,
        'status': 'SENT_BY_SYSTEM',
        'type': 'PLAIN',
        'next': '5'
      },
      {
        'id': 5,
        'last-modified': 1502352173027,
        'contains-media': 'food_pyramid.jpg',
        'server-message': '',
        'message-timestamp': 1502352173027,
        'status': 'SENT_BY_SYSTEM',
        'type': 'PLAIN',
        'next': '6'
      },
      {
        'id': 6,
        'last-modified': 1502352173027,
        'server-message': 'Lebensmittel der unteren Pyramidenstufen werden in grösseren, solche der oberen Stufen in kleineren Mengen benötigt. Es gibt keine verbotenen Lebensmittel. Die Kombination der Lebensmittel im richtigen Verhältnis macht eine ausgewogene Ernährung aus.',
        'message-timestamp': 1502352173027,
        'status': 'SENT_BY_SYSTEM',
        'type': 'PLAIN',
        'next': '7'
      },
      {
        'id': 7,
        'last-modified': 1502352173027,
        'server-message': 'Aber mehr dazu hier:',
        'message-timestamp': 1502352173027,
        'status': 'SENT_BY_SYSTEM',
        'type': 'PLAIN',
        'next': '8'
      },
      {
        'id': 8,
        'last-modified': 1502352250618,
        'expects-answer': true,
        'server-message': 'SHOWINFO\nAusgewogenes Essen und Trinken mit der Schweizer Lebensmittelpyramide',
        'content': '<h1>Ausgewogenes Essen und Trinken mit der Schweizer Lebensmittelpyramide</h1>' +
                   '<p>Ausgewogenes und genussvolles Essen und Trinken ist Teil eines gesunden Lebensstils. Es versorgt den Körper mit Energie, lebenswichtigen Nähr- sowie Schutzstoffen, fördert das körperliche Wohlbefinden und trägt dazu bei, Krankheiten vorzubeugen.</p>' +
                   '<p>Die Schweizer Lebensmittelpyramide veranschaulicht bildlich eine ausgewogene Ernährung. Lebensmittel der unteren Pyramidenstufen werden in grösseren, solche der oberen Stufen in kleineren Mengen benötigt. Es gibt keine verbotenen Lebensmittel. Die Kombination der Lebensmittel im richtigen Verhältnis macht eine ausgewogene Ernährung aus.</p>' +
                   '<p>Die Lebensmittelpyramide ist kein starrer Ernährungsplan, sondern erlaubt ein individuelles Zusammenstellen von Lebensmitteln, Getränken und Speisen nach persönlichen Vorlieben, Abneigungen und Gewohnheiten. Die aufgeführten Lebensmittelmengen dienen als Orientierung. Je nach Energiebedarf (abhängig von Alter, Geschlecht, Grösse, körperlicher Aktivität etc.) gelten die kleineren bzw. grösseren Portionenangaben. Die Empfehlungen müssen nicht jeden Tag, sondern sollen langfristig eingehalten werden, z. B. über den Verlauf einer Woche. Eine Ausnahme bilden die Empfehlungen zu den Getränken, die täglich zu berücksichtigen sind. </p>' +
                   '<img src="food_pyramid" />',
        'message-timestamp': 1502352250618,
        'status': 'SENT_BY_SYSTEM',
        'type': 'COMMAND',
        'next': '9'
      },
      {
        'id': 9,
        'last-modified': 1502352173027,
        'server-message': 'Super. Alle bereits gesammelten Informationen kannst du übrigens jederzeit in deinem Rucksack finden.',
        'message-timestamp': 1502352173027,
        'status': 'SENT_BY_SYSTEM',
        'type': 'PLAIN',
        'next': null
      }
    ]
  },
  {
    title: 'Zucker und Salz',
    messages: [
      {
        'id': 0,
        'last-modified': 1502352173027,
        'server-message': 'Los gehts ☺ Wieder Richtung Tal. Wir fangen also mit der Stufe Süsses, Salziges & Alkoholisches an und betrachten zunächst den Zucker.',
        'server-timestamp': 1502352173027,
        'status': 'SENT_BY_SYSTEM',
        'expects-answer': false,
        'type': 'PLAIN',
        'next': '1'
      },
      {
        'id': 1,
        'last-modified': 1502352173027,
        'contains-media': 'sugar.jpg',
        'server-message': '',
        'message-timestamp': 1502352173027,
        'status': 'SENT_BY_SYSTEM',
        'type': 'PLAIN',
        'next': '2'
      },
      {
        'id': 2,
        'last-modified': 1502352173027,
        'server-message': 'Der durchschnittliche Schweizer nimmt pro Tag 127 g Zucker zu sich. Dies sind fast 20% der Energiezufuhr und damit doppelt so viel als die Weltgesundheitsorganisation WHO empfiehlt. ' +
          '😓 Ein übermässiger Konsum von Zucker spielt eine bedeutende Rolle als Ursache für Adipositas und Krankheiten wie Diabetes Typ 2 und Zahnkaries. ' +
          'Dabei gilt es vor allem den zugesetzten Zucker zu vermeiden und nicht die natürlicherweise vorkommenden Zuckerarten aus Früchten oder Milch.',
        'server-timestamp': 1502352173027,
        'status': 'SENT_BY_SYSTEM',
        'expects-answer': false,
        'type': 'PLAIN',
        'next': 3
      },
      {
        'id': 3,
        'last-modified': 1502352173027,
        'server-message': 'Lass uns zwei Punkte genauer anschauen. Zunächst: Was ist eigentlich zugesetzter Zucker?',
        'server-timestamp': 1502352173027,
        'status': 'SENT_BY_SYSTEM',
        'expects-answer': false,
        'type': 'PLAIN',
        'next': 4
      },
      {
        'id': 4,
        'last-modified': 1502352250618,
        'expects-answer': true,
        'server-message': 'SHOWINFO\nWas bedeutet eigentlich „zugesetzter Zucker“?',
        'content': '<h1>Zugesetzter Zucker</h1>',
        'message-timestamp': 1502352250618,
        'status': 'SENT_BY_SYSTEM',
        'type': 'COMMAND',
        'next': null
      }
    ]
  }
]

export default FoodInfoDialogues

// Getränkestufe:
/*
'content': '<h1>Schweizer Lebensmittelpyramide – Stufe Getränke</h1>' +
           '<p>Getränke versorgen den Körper mit Flüssigkeit (Wasser), wichtigen Mineralstoffen (z.B. Calcium) und löschen den Durst. Wasser braucht der Körper als Baustoff für die Zellen, als Transportmittel (z.B. Blut) und zur Regulation des Wärmehaushalts (Schwitzen).</p>' +
           '<h1>Was gehört dazu?</h1>' +
           '<ul><li>Hahnenwasser</li><li>Mineralwasser</li><li>Früchte- und Kräutertee (ungesüsst)</li><li>Kaffee, Schwarz- und Grüntee (massvoll)</li></ul>' +
           '<h1>Was gehört nicht dazu?</h1>' +
           '<p>Nicht zu den Getränken zählen laut der Lebensmittelpyramide:</p>' +
           '<ul><li>Milch, Milchmischgetränke</li><li>Säfte</li><li>energiereiche Getränke wie Limonaden, Eistee, Energy Drinks, Sirupe, Light- / Zero-Getränke und Alkoholika</li></ul>' +
           '<p>Sie sind nämlich nicht reine Flüssigkeitslieferanten, sondern liefern meist viel Energie (Kalorien) und verschiedene Inhaltsstoffe (z.B. Zucker, Fett, Protein, Vitamine, Alkohol, zahnschädigende Säuren).</p>' +
           '<img src="food_pyramid" />',
*/
