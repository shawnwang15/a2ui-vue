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
  const galleryDataContent: AnyRecord = {
    key: 'galleryData',
    valueMap: [
      { key: 'textField', valueString: 'Hello World' },
      { key: 'checkbox', valueBoolean: false },
      { key: 'checkboxChecked', valueBoolean: true },
      { key: 'slider', valueNumber: 30 },
      { key: 'date', valueString: '2025-10-26' },
      { key: 'favorites', valueMap: [{ key: '0', valueString: 'A' }] },
      { key: 'favoritesChips', valueMap: [] },
      { key: 'favoritesFilter', valueMap: [] },
    ],
  };

  function addDemoSurface(surfaceId: string, componentDef: AnyRecord): void {
    const rootId = `${surfaceId}-root`;
    messages.push({ beginRendering: { surfaceId, root: rootId } });
    messages.push({
      surfaceUpdate: {
        surfaceId,
        components: [{ id: rootId, component: componentDef }],
      },
    });
    messages.push({
      dataModelUpdate: { surfaceId, contents: [galleryDataContent] },
    });
  }

  // 1. TextField
  addDemoSurface('demo-text', {
    TextField: {
      label: { literalString: 'Enter some text' },
      text: { path: 'galleryData/textField' },
    },
  });

  // 1b. TextField (Regex)
  addDemoSurface('demo-text-regex', {
    TextField: {
      label: { literalString: 'Enter exactly 5 digits' },
      text: { path: 'galleryData/textFieldRegex' },
      validationRegexp: '^\\d{5}$',
    },
  });

  // 2. CheckBox
  addDemoSurface('demo-checkbox', {
    CheckBox: {
      label: { literalString: 'Toggle me' },
      value: { path: 'galleryData/checkbox' },
    },
  });

  // 3. Slider
  addDemoSurface('demo-slider', {
    Slider: {
      value: { path: 'galleryData/slider' },
      minValue: 0,
      maxValue: 100,
    },
  });

  // 4. DateTimeInput
  addDemoSurface('demo-date', {
    DateTimeInput: { value: { path: 'galleryData/date' }, enableDate: true },
  });

  // 5. MultipleChoice (Default)
  addDemoSurface('demo-multichoice', {
    MultipleChoice: {
      selections: { path: 'galleryData/favorites' },
      options: [
        { label: { literalString: 'Apple' }, value: 'A' },
        { label: { literalString: 'Banana' }, value: 'B' },
        { label: { literalString: 'Cherry' }, value: 'C' },
      ],
    },
  });

  // 5b. MultipleChoice (Chips)
  addDemoSurface('demo-multichoice-chips', {
    MultipleChoice: {
      selections: { path: 'galleryData/favoritesChips' },
      description: 'Select tags (Chips)',
      variant: 'chips',
      options: [
        { label: { literalString: 'Work' }, value: 'work' },
        { label: { literalString: 'Home' }, value: 'home' },
        { label: { literalString: 'Urgent' }, value: 'urgent' },
        { label: { literalString: 'Later' }, value: 'later' },
      ],
    },
  });

  // 5c. MultipleChoice (Filterable)
  addDemoSurface('demo-multichoice-filter', {
    MultipleChoice: {
      selections: { path: 'galleryData/favoritesFilter' },
      description: 'Select countries (Filterable)',
      filterable: true,
      options: [
        { label: { literalString: 'United States' }, value: 'US' },
        { label: { literalString: 'Canada' }, value: 'CA' },
        { label: { literalString: 'United Kingdom' }, value: 'UK' },
        { label: { literalString: 'Australia' }, value: 'AU' },
        { label: { literalString: 'Germany' }, value: 'DE' },
        { label: { literalString: 'France' }, value: 'FR' },
        { label: { literalString: 'Japan' }, value: 'JP' },
      ],
    },
  });

  // 6. Image
  addDemoSurface('demo-image', {
    Image: {
      url: { literalString: `${baseUrl}/assets/a2ui.png` },
      usageHint: 'mediumFeature',
    },
  });

  // 7. Button (needs a child Text component)
  const buttonSurfaceId = 'demo-button';
  const btnRootId = 'demo-button-root';
  const btnTextId = 'demo-button-text';
  messages.push({ beginRendering: { surfaceId: buttonSurfaceId, root: btnRootId } });
  messages.push({
    surfaceUpdate: {
      surfaceId: buttonSurfaceId,
      components: [
        {
          id: btnTextId,
          component: { Text: { text: { literalString: 'Trigger Action' } } },
        },
        {
          id: btnRootId,
          component: {
            Button: {
              child: btnTextId,
              primary: true,
              action: {
                name: 'custom_action',
                context: [{ key: 'info', value: { literalString: 'Custom Button Clicked' } }],
              },
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
  messages.push({ beginRendering: { surfaceId: tabsSurfaceId, root: tabsRootId } });
  messages.push({
    surfaceUpdate: {
      surfaceId: tabsSurfaceId,
      components: [
        { id: tab1Id, component: { Text: { text: { literalString: 'First Tab Content' } } } },
        { id: tab2Id, component: { Text: { text: { literalString: 'Second Tab Content' } } } },
        {
          id: tabsRootId,
          component: {
            Tabs: {
              tabItems: [
                { title: { literalString: 'View One' }, child: tab1Id },
                { title: { literalString: 'View Two' }, child: tab2Id },
              ],
            },
          },
        },
      ],
    },
  });

  // 9. Icon
  const iconSurfaceId = 'demo-icon';
  messages.push({ beginRendering: { surfaceId: iconSurfaceId, root: 'icon-root' } });
  messages.push({
    surfaceUpdate: {
      surfaceId: iconSurfaceId,
      components: [
        {
          id: 'icon-root',
          component: {
            Row: {
              children: { explicitList: ['icon-1', 'icon-2', 'icon-3'] },
              distribution: 'spaceEvenly',
              alignment: 'center',
            },
          },
        },
        { id: 'icon-1', component: { Icon: { name: { literalString: 'star' } } } },
        { id: 'icon-2', component: { Icon: { name: { literalString: 'home' } } } },
        { id: 'icon-3', component: { Icon: { name: { literalString: 'settings' } } } },
      ],
    },
  });

  // 10. Divider
  const divSurfaceId = 'demo-divider';
  messages.push({ beginRendering: { surfaceId: divSurfaceId, root: 'div-root' } });
  messages.push({
    surfaceUpdate: {
      surfaceId: divSurfaceId,
      components: [
        {
          id: 'div-root',
          component: {
            Column: {
              children: { explicitList: ['div-text-1', 'div-horiz', 'div-text-2'] },
              distribution: 'start',
              alignment: 'stretch',
            },
          },
        },
        { id: 'div-text-1', component: { Text: { text: { literalString: 'Above Divider' } } } },
        { id: 'div-horiz', component: { Divider: { axis: 'horizontal' } } },
        { id: 'div-text-2', component: { Text: { text: { literalString: 'Below Divider' } } } },
      ],
    },
  });

  // 11. Card
  const cardSurfaceId = 'demo-card';
  messages.push({ beginRendering: { surfaceId: cardSurfaceId, root: 'card-root' } });
  messages.push({
    surfaceUpdate: {
      surfaceId: cardSurfaceId,
      components: [
        { id: 'card-root', component: { Card: { child: 'card-text' } } },
        { id: 'card-text', component: { Text: { text: { literalString: 'I am inside a Card' } } } },
      ],
    },
  });

  // 12. Video
  addDemoSurface('demo-video', {
    Video: {
      url: {
        literalString:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      },
    },
  });

  // 13. Modal
  const modalSurfaceId = 'demo-modal';
  messages.push({ beginRendering: { surfaceId: modalSurfaceId, root: 'modal-root' } });
  messages.push({
    surfaceUpdate: {
      surfaceId: modalSurfaceId,
      components: [
        {
          id: 'modal-root',
          component: {
            Modal: { entryPointChild: 'modal-btn', contentChild: 'modal-content' },
          },
        },
        {
          id: 'modal-btn',
          component: {
            Button: { child: 'modal-btn-text', primary: false, action: { name: 'noop' } },
          },
        },
        { id: 'modal-btn-text', component: { Text: { text: { literalString: 'Open Modal' } } } },
        {
          id: 'modal-content',
          component: { Text: { text: { literalString: 'This is the modal content!' } } },
        },
      ],
    },
  });

  // 14. List
  const listSurfaceId = 'demo-list';
  messages.push({ beginRendering: { surfaceId: listSurfaceId, root: 'list-root' } });
  messages.push({
    surfaceUpdate: {
      surfaceId: listSurfaceId,
      components: [
        {
          id: 'list-root',
          component: {
            List: {
              children: { explicitList: ['list-item-1', 'list-item-2', 'list-item-3'] },
              direction: 'vertical',
              alignment: 'stretch',
            },
          },
        },
        { id: 'list-item-1', component: { Text: { text: { literalString: 'Item 1' } } } },
        { id: 'list-item-2', component: { Text: { text: { literalString: 'Item 2' } } } },
        { id: 'list-item-3', component: { Text: { text: { literalString: 'Item 3' } } } },
      ],
    },
  });

  // 15. AudioPlayer
  addDemoSurface('demo-audio', {
    AudioPlayer: {
      url: { literalString: `${baseUrl}/assets/audio.mp3` },
      description: { literalString: 'Local Audio Sample' },
    },
  });

  // Response surface
  messages.push({ beginRendering: { surfaceId: 'response-surface', root: 'response-text' } });
  messages.push({
    surfaceUpdate: {
      surfaceId: 'response-surface',
      components: [
        {
          id: 'response-text',
          component: {
            Text: {
              text: {
                literalString:
                  'Interact with the gallery to see responses. This view is updated by the ' +
                  'agent by relaying the raw action commands it received from the client',
              },
            },
          },
        },
      ],
    },
  });

  return JSON.stringify(messages, null, 2);
}
