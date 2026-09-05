module.exports = {
      content: ['./index.html', './script.js', './rig.js'],
      theme: {
        extend: {
          fontFamily: {
            serif: ['Cormorant Garamond', 'Georgia', 'serif'],
            sans: ['Manrope', 'system-ui', 'sans-serif'],
          },
          colors: {
            bg:         '#F8F6F1',
            surface:    '#FCFBF8',
            ink:        '#27231F',
            soft:       '#625D56',
            faint:      '#817A71',
            beige:      '#E9E4DC',
            sand:       '#F1EDE6',
            rose:       '#C9B8AA',
            accent:     '#8A6F60',
            accentDeep: '#6F574B',
            line:       '#DDD7CE',
          },
          letterSpacing: {
            tightest: '-0.03em',
          },
        },
      },
    };
