'use strict';

/* Require the Fractal module */
const fractal = module.exports = require('@frctl/fractal').create();
const mandelbrot = require('@frctl/mandelbrot');
const instance = fractal.components.engine();

/* Give your project a title. */
fractal.set('project.title', 'Fractal Component Library');

/* Tell Fractal where to look for components. */
fractal.components.set('path', `${__dirname}/src/components`);

/**
 * configuration
 */
fractal.components.set('statuses', {
  doing: {
    label: "Doing",
    description: "I'm doning it.",
    color: '#F00'
  },
  dong: {
    label: "Done",
    description: "I'm done with this.",
    color: "green"
  },
});
fractal.components.set('default.status', 'doing');
fractal.components.set('default.preview', '@preview');

/* Tell Fractal where to look for documentation pages. */
fractal.docs.set('path', `${__dirname}/src/docs`);

/* Tell the Fractal web preview plugin where to look for static assets. */
fractal.web.set('static.path', `${__dirname}/public`);

/* Set the static HTML build destination */
fractal.web.set('builder.dest', `${__dirname}/build`);


/* Theme */
fractal.web.theme(
  mandelbrot({
    skin: {
      name: 'fuchsia',
      accent: '#C23582',
      complement: '#FFFFFF',
      links: '#C23582',
    },
    information: [
      {
        label: 'Version',
        value: require('./package.json').version,
      },
      {
        label: 'Built on',
        value: new Date(),
        type: 'time',
        format: (value) => {
          return value.toLocaleDateString('en');
        },
      },
    ],
    panels: ['html', 'view', 'context', 'info', 'notes'],
  })
);

/**
 * handlebars helpers
 */
instance.handlebars.registerHelper('if_eq', function(arg1, arg2, options) {
  return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

import fs from 'fs';
instance.handlebars.registerHelper('inlineSVG', function(arg) {
  const data = fs.readFileSync(arg, 'utf8');
  return data;
});