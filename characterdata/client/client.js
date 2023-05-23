import alt from 'alt';

alt.onServer('openCharacterEditor', (htmlPath) => {
  alt.emit('chat:clear');
  alt.emit('chat:toggle', false);
  alt.emit('browser:create', 'CharacterEditor', htmlPath);
});

alt.onServer('closeCharacterEditor', () => {
  alt.emit('chat:toggle', true);
  alt.emit('browser:destroy', 'CharacterEditor');
});
