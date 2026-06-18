/** @type {import('tailwindcss').Config} */
export default {
  future: {
    hoverOnlyWhenSupported: true
  },
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      backgroundImage: {
        checkIcon:
          "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjAgMjJINEMyLjg5NSAyMiAyIDIxLjEwNSAyIDIwVjRDMiAyLjg5NSAyLjg5NSAyIDQgMkgyMEMyMS4xMDUgMiAyMiAyLjg5NSAyMiA0VjIwQzIyIDIxLjEwNSAyMS4xMDUgMjIgMjAgMjJaIiBmaWxsPSIjMDA5OUZGIi8+DQo8cGF0aCBkPSJNNy4wNzg3NCAxMS43Njg0TDEwLjk5MDcgMTUuNDA5NEwxNy4yODY3IDguMzI2MzkiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+DQo8L3N2Zz4NCg==')",
        radioIcon:
          "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOC44MDA2NCAxM0w1IDkuNzg1NzlMNS42OTI4NiA4Ljk0MjE1TDguNTk5MjggMTEuMzk5MUwxMy4xMjAyIDVMMTQgNS42NDAwNkw4LjgwMDY0IDEzWk05IDBDNC4wMjk3NSAwIDAgNC4wMjk3NSAwIDlDMCAxMy45NzEgNC4wMjk3NSAxOCA5IDE4QzEzLjk3MDMgMTggMTggMTMuOTcxIDE4IDlDMTggNC4wMjk3NSAxMy45NzAzIDAgOSAwWiIgZmlsbD0iI0RFRTRFOSIvPg0KPC9zdmc+DQo=')",
        checkedRadioIcon:
          "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOC44MDA2NCAxM0w1IDkuNzg1NzlMNS42OTI4NiA4Ljk0MjE1TDguNTk5MjggMTEuMzk5MUwxMy4xMjAyIDVMMTQgNS42NDAwNkw4LjgwMDY0IDEzWk05IDBDNC4wMjk3NSAwIDAgNC4wMjk3NSAwIDlDMCAxMy45NzEgNC4wMjk3NSAxOCA5IDE4QzEzLjk3MDMgMTggMTggMTMuOTcxIDE4IDlDMTggNC4wMjk3NSAxMy45NzAzIDAgOSAwWiIgZmlsbD0iIzAwOTlGRiIvPg0KPC9zdmc+DQo=')",
        checkRoundIcon:
          "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBmaWxsPSIjREVFNEU5Ii8+DQo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPg0KPC9zdmc+DQo=')",
        checkedRoundIcon:
          "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBmaWxsPSIjMDA5OUZGIi8+DQo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPg0KPC9zdmc+DQo=')"
      },
      borderRadius: {
        lg: '10px',
        xlg: '20px'
      },
      zIndex: {
        //Layer - Cover
        100: 100, //layer1
        200: 200, //layer2
        300: 300, //layer3
        400: 400, //...4
        500: 500, //...5

        //Layer Element
        1: 1, //CustomMarker, MapController

        10: 10, //Map , Slider Desc
        20: 20, //Header, Slider header pagination
        30: 30, //summary

        99: 99, //TopBanner

        150: 150, //BackDrop
        170: 170, //Loading, Spinner, Modal, BottomSheet, Slider Container

        199: 199 //Toast
      },
      colors: {
        // Modu color
        main: {
          '010': '#EBF7FF',
          '020': '#DAF0FF',
          '030': '#6DC5FF',
          '040': '#49B6FF',
          '050': '#0099FF',
          '060': '#0088E6',
          '070': '#0077CC',
          '080': '#0066B3',
          '090': '#005499'
        },
        //Sub Color
        variant: {
          '010': '#DDF5F5',
          '050': '#00FFFA',
          '080': 'rgba(61, 200, 197, 0.9)',
          '090': '#3DC8C5'
        },
        notice: {
          '040': '#FFEC92',
          '050': '#FFE56B'
        },
        caution: {
          '010': '#FFF3F3',
          '040': 'rgba(255, 112, 112, 0.9)',
          '050': '#FF7070',
          '070': '#FF4C4C'
        },
        //  Grayscale
        gray: {
          '010': '#FFFFFF',
          '020': '#F0F4F7',
          '030': '#DEE4E9',
          '040': '#CCD3DB',
          '050': '#B8C3D0',
          '060': '#6D7D90',
          '070': '#4A5766',
          '080': '#263238',
          '090': '#000000'
        },
        dim: {
          '050': 'rgba(0, 0, 0, 0.65)',
          '060': 'rgba(0, 0, 0, 0.75)'
        }
      },
      screens: {
        min: '320px',
        max: '430px'
      },
      boxShadow: {
        0o0: '0 0px 0px 0 rgba(0,0,0,0)',
        110: '0 -2px 6px 0 rgba(0, 0, 0, 0.1)',
        120: '0 2px 6px 0 rgba(0, 0, 0, 0.2)',
        130: '0 2px 4px 0 rgba(0, 0, 0, 0.3)',
        140: '0 -2px 4px 0 rgba(0, 0, 0, 0.1)',
        150: '0 2px 6px 0 rgba(0, 0, 0, 0.1)'
      },
      fontSize: {
        36: '36px',
        30: '30px',
        24: '24px',
        20: '20px',
        17: '17px',
        16: '16px',
        15: '15px',
        14: '14px',
        12: '12px',
        10: '10px'
      },
      fontWeight: {
        regular: 400,
        medium: 500,
        bold: 700
      },
      lineHeight: {
        54: '54px',
        40: '40px',
        34: '34px',
        30: '30px',
        26: '26px',
        24: '24px',
        22: '22px',
        18: '18px',
        12: '12px'
      },

      backgroundColor: ({ theme }) => ({
        '010': theme('colors.gray.010'),
        '020': theme('colors.gray.020'),
        '030': theme('colors.gray.030'),
        '090': theme('colors.gray.090'),
        'dim-050': theme('colors.dim.050'),
        'dim-090': theme('colors.dim.060'),
        'catuion-050': theme('colors.caution.050')
      }),

      textColor: ({ theme }) => ({
        'text-010': theme('colors.gray.010'),
        'text-050': theme('colors.gray.050'),
        'text-070': theme('colors.gray.060'),
        'text-090': theme('colors.gray.080'),
        'main-050': theme('colors.main.050'),
        'caution-070': theme('colors.caution.070')
      }),

      borderColor: ({ theme }) => ({
        '010': theme('colors.gray.010'),
        '020': theme('colors.gray.020'),
        '030': theme('colors.gray.030'),
        '050': theme('colors.gray.050'),
        '060': theme('colors.gray.060'),
        '070': theme('colors.gray.070'),
        '080': theme('colors.gray.080'),
        '090': theme('colors.gray.090')
      })
    }
  },
  plugins: []
}
