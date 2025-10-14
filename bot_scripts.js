function start_script (name) {
  return (
    `Hi, ${name}, I am Car Insurance bot! 
    A'll be happy to assist you with car insurance purchasing!
    Would you like to proceed further?`,
    Markup.keyboard([
        ['Proceed']
    ])
    .resize()
);
}

module.exports = { start_script };
