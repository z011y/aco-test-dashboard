export const chartColors = {
    red: [
        '#FF4438',
        '#EC6858',
        '#BB3020',
        '#EF8F8C',
        '#8C1A11',
    ],
    yellow: [
        '#FFC629',
        '#F9D961',
        '#E7B33D',
        '#FBE595',
        '#D68E32',
    ],
    teal: [
        '#00E8AB',
        '#83FBD4',
        '#5CC99D',
        '#A6FCEC',
        '#439782',
    ],
    cyan: [
        '#20C4F4',
        '#47DAFF',
        '#0094C7',
        '#8FE8FF',
        '#005D8F',
    ],
    blue: [
        '#0D09FF',
        '#5858FF',
        '#0000CC',
        '#9898FF',
        '#000099',
    ],
    purple: [
        '#B020F4',
        '#C04EF6',
        '#8A1AD8',
        '#DB8EF8',
        '#6C12BB',
    ],
    pink: [
        '#F420DF',
        '#EB56D4',
        '#C128B8',
        '#F095CF',
        '#991E8C',
    ]
}

export const baseColorOrder = [
    'cyan',
    'yellow',
    'teal',
    'red',
    'blue',
    'purple',
    'pink',
]

/**
 * Returns array with matched colors with items
 *
 * @param {array} items an array of items to get colors for
 * @param {array} colorOrder colorOrder override
 * 
 * @returns {object} an object with {id, label, color, value}
 */
export function qualitativeColors(items, colorOrder = baseColorOrder) {
    const colorItems = {};
    let colorIndex = 0;
    let colorIterations = 0;

    items.forEach((item, i) => {
        // if too many items to colors, just repeat colors
        if (!chartColors[colorOrder[colorIndex]][colorIterations]) {
            colorIndex = 0;
            colorIterations = 0;
        }
        colorItems[item] = {
            id: i.toString(),
            label: item,
            color: chartColors[colorOrder[colorIndex]][colorIterations],
            value: false,
        }

        colorIndex++;
        if (colorIndex > colorOrder.length - 1) {
            colorIterations++;
            colorIndex = 0;
        }
    }); 

    return colorItems;
}