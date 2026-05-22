// Copyright 2026 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Component Gallery examples — TypeScript port of gallery_examples.py
 */

type AnyRecord = Record<string, unknown>;

export function getGalleryJson(baseUrl: string): string {
  const messages: AnyRecord[] = [];

  // Common data model shared across all demo surfaces
  const galleryDataValue: AnyRecord = {
    galleryData: {
      textField: 'Hello World',
      checkbox: false,
      checkboxChecked: true,
      slider: 30,
      date: '2025-10-26',
      favorites: ['A'],
      favoritesChips: [],
      favoritesFilter: [],
    },
  };

  function addDemoSurface(surfaceId: string, componentProps: AnyRecord): void {
    const rootId = `${surfaceId}-root`;
    messages.push({ createSurface: { surfaceId, root: rootId } });
    messages.push({
      updateComponents: {
        surfaceId,
        components: [{ id: rootId, ...componentProps }],
      },
    });
    messages.push({
      updateDataModel: { surfaceId, value: galleryDataValue },
    });
  }

  // 1. TextField
  addDemoSurface('demo-text', {
    component: 'TextField',
    label: 'Enter some text',
    value: { path: 'galleryData/textField' },
  });

  // 1b. TextField (Regex)
  addDemoSurface('demo-text-regex', {
    component: 'TextField',
    label: 'Enter exactly 5 digits',
    value: { path: 'galleryData/textFieldRegex' },
    validationRegexp: '^\\d{5}$',
  });

  // 2. CheckBox
  addDemoSurface('demo-checkbox', {
    component: 'CheckBox',
    label: 'Toggle me',
    value: { path: 'galleryData/checkbox' },
  });

  // 3. Slider
  addDemoSurface('demo-slider', {
    component: 'Slider',
    value: { path: 'galleryData/slider' },
    min: 0,
    max: 100,
  });

  // 4. DateTimeInput
  addDemoSurface('demo-date', {
    component: 'DateTimeInput',
    value: { path: 'galleryData/date' },
    enableDate: true,
  });

  // 5. ChoicePicker (Default)
  addDemoSurface('demo-multichoice', {
    component: 'ChoicePicker',
    selections: { path: 'galleryData/favorites' },
    options: [
      { label: 'Apple', value: 'A' },
      { label: 'Banana', value: 'B' },
      { label: 'Cherry', value: 'C' },
    ],
  });

  // 5b. ChoicePicker (Chips)
  addDemoSurface('demo-multichoice-chips', {
    component: 'ChoicePicker',
    selections: { path: 'galleryData/favoritesChips' },
    description: 'Select tags (Chips)',
    variant: 'chips',
    options: [
      { label: 'Work', value: 'work' },
      { label: 'Home', value: 'home' },
      { label: 'Urgent', value: 'urgent' },
      { label: 'Later', value: 'later' },
    ],
  });

  // 5c. ChoicePicker (Filterable)
  addDemoSurface('demo-multichoice-filter', {
    component: 'ChoicePicker',
    selections: { path: 'galleryData/favoritesFilter' },
    description: 'Select countries (Filterable)',
    filterable: true,
    options: [
      { label: 'United States', value: 'US' },
      { label: 'Canada', value: 'CA' },
      { label: 'United Kingdom', value: 'UK' },
      { label: 'Australia', value: 'AU' },
      { label: 'Germany', value: 'DE' },
      { label: 'France', value: 'FR' },
      { label: 'Japan', value: 'JP' },
    ],
  });

  // 6. Image
  addDemoSurface('demo-image', {
    component: 'Image',
    url: `${baseUrl}/assets/a2ui.png`,
    variant: 'mediumFeature',
  });

  // 7. Button (needs a child Text component)
  const buttonSurfaceId = 'demo-button';
  const btnRootId = 'demo-button-root';
  const btnTextId = 'demo-button-text';
  messages.push({ createSurface: { surfaceId: buttonSurfaceId, root: btnRootId } });
  messages.push({
    updateComponents: {
      surfaceId: buttonSurfaceId,
      components: [
        {
          id: btnTextId,
          component: 'Text',
          text: 'Trigger Action',
        },
        {
          id: btnRootId,
          component: 'Button',
          child: btnTextId,
          variant: 'primary',
          action: {
            event: {
              name: 'custom_action',
              context: { info: 'Custom Button Clicked' },
            },
          },
        },
      ],
    },
  });

  // 8. Tabs
  const tabsSurfaceId = 'demo-tabs';
  const tabsRootId = 'demo-tabs-root';
  const tab1Id = 'tab-1-content';
  const tab2Id = 'tab-2-content';
  messages.push({ createSurface: { surfaceId: tabsSurfaceId, root: tabsRootId } });
  messages.push({
    updateComponents: {
      surfaceId: tabsSurfaceId,
      components: [
        { id: tab1Id, component: 'Text', text: 'First Tab Content' },
        { id: tab2Id, component: 'Text', text: 'Second Tab Content' },
        {
          id: tabsRootId,
          component: 'Tabs',
          tabs: [
            { title: 'View One', child: tab1Id },
            { title: 'View Two', child: tab2Id },
          ],
        },
      ],
    },
  });

  // 9. Icon
  const iconSurfaceId = 'demo-icon';
  messages.push({ createSurface: { surfaceId: iconSurfaceId, root: 'icon-root' } });
  messages.push({
    updateComponents: {
      surfaceId: iconSurfaceId,
      components: [
        {
          id: 'icon-root',
          component: 'Row',
          children: ['icon-1', 'icon-2', 'icon-3'],
          justify: 'spaceEvenly',
          align: 'center',
        },
        { id: 'icon-1', component: 'Icon', name: 'star' },
        { id: 'icon-2', component: 'Icon', name: 'home' },
        { id: 'icon-3', component: 'Icon', name: 'settings' },
      ],
    },
  });

  // 10. Divider
  const divSurfaceId = 'demo-divider';
  messages.push({ createSurface: { surfaceId: divSurfaceId, root: 'div-root' } });
  messages.push({
    updateComponents: {
      surfaceId: divSurfaceId,
      components: [
        {
          id: 'div-root',
          component: 'Column',
          children: ['div-text-1', 'div-horiz', 'div-text-2'],
          justify: 'start',
          align: 'stretch',
        },
        { id: 'div-text-1', component: 'Text', text: 'Above Divider' },
        { id: 'div-horiz', component: 'Divider', axis: 'horizontal' },
        { id: 'div-text-2', component: 'Text', text: 'Below Divider' },
      ],
    },
  });

  // 11. Card
  const cardSurfaceId = 'demo-card';
  messages.push({ createSurface: { surfaceId: cardSurfaceId, root: 'card-root' } });
  messages.push({
    updateComponents: {
      surfaceId: cardSurfaceId,
      components: [
        { id: 'card-root', component: 'Card', child: 'card-text' },
        { id: 'card-text', component: 'Text', text: 'I am inside a Card' },
      ],
    },
  });

  // 12. Video
  addDemoSurface('demo-video', {
    component: 'Video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  });

  // 13. Modal
  const modalSurfaceId = 'demo-modal';
  messages.push({ createSurface: { surfaceId: modalSurfaceId, root: 'modal-root' } });
  messages.push({
    updateComponents: {
      surfaceId: modalSurfaceId,
      components: [
        {
          id: 'modal-root',
          component: 'Modal',
          trigger: 'modal-btn',
          content: 'modal-content',
        },
        {
          id: 'modal-btn',
          component: 'Button',
          child: 'modal-btn-text',
          variant: 'secondary',
          action: { event: { name: 'noop' } },
        },
        { id: 'modal-btn-text', component: 'Text', text: 'Open Modal' },
        {
          id: 'modal-content',
          component: 'Text',
          text: 'This is the modal content!',
        },
      ],
    },
  });

  // 14. List
  const listSurfaceId = 'demo-list';
  messages.push({ createSurface: { surfaceId: listSurfaceId, root: 'list-root' } });
  messages.push({
    updateComponents: {
      surfaceId: listSurfaceId,
      components: [
        {
          id: 'list-root',
          component: 'List',
          children: ['list-item-1', 'list-item-2', 'list-item-3'],
          direction: 'vertical',
          align: 'stretch',
        },
        { id: 'list-item-1', component: 'Text', text: 'Item 1' },
        { id: 'list-item-2', component: 'Text', text: 'Item 2' },
        { id: 'list-item-3', component: 'Text', text: 'Item 3' },
      ],
    },
  });

  // 15. AudioPlayer
  addDemoSurface('demo-audio', {
    component: 'AudioPlayer',
    url: `${baseUrl}/assets/audio.mp3`,
    description: 'Local Audio Sample',
  });

  // Response surface
  messages.push({ createSurface: { surfaceId: 'response-surface', root: 'response-text' } });
  messages.push({
    updateComponents: {
      surfaceId: 'response-surface',
      components: [
        {
          id: 'response-text',
          component: 'Text',
          text:
            'Interact with the gallery to see responses. This view is updated by the ' +
            'agent by relaying the raw action commands it received from the client',
        },
      ],
    },
  });

  return JSON.stringify(messages, null, 2);
}
