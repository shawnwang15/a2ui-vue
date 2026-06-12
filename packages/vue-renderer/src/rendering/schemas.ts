import type { z } from 'zod';
import {
  TextApi,
  ImageApi,
  IconApi,
  VideoApi,
  AudioPlayerApi,
  RowApi,
  ColumnApi,
  ListApi,
  CardApi,
  TabsApi,
  ModalApi,
  DividerApi,
  ButtonApi,
  TextFieldApi,
  CheckBoxApi,
  ChoicePickerApi,
  SliderApi,
  DateTimeInputApi,
} from '@a2ui/web_core/v0_9/basic_catalog';

/**
 * Maps each v0.9 basic-catalog component type name to its real Zod schema.
 *
 * The {@link GenericBinder} relies on schema scraping to classify each
 * property (DYNAMIC / ACTION / STRUCTURAL / CHECKABLE / STATIC), so the
 * renderer must hand it the real component schemas rather than a permissive
 * `z.any()`. Keyed by `api.name` to match the Vue catalog type names 1:1.
 */
export const SCHEMA_REGISTRY: Record<string, z.ZodTypeAny> = {
  [TextApi.name]: TextApi.schema,
  [ImageApi.name]: ImageApi.schema,
  [IconApi.name]: IconApi.schema,
  [VideoApi.name]: VideoApi.schema,
  [AudioPlayerApi.name]: AudioPlayerApi.schema,
  [RowApi.name]: RowApi.schema,
  [ColumnApi.name]: ColumnApi.schema,
  [ListApi.name]: ListApi.schema,
  [CardApi.name]: CardApi.schema,
  [TabsApi.name]: TabsApi.schema,
  [ModalApi.name]: ModalApi.schema,
  [DividerApi.name]: DividerApi.schema,
  [ButtonApi.name]: ButtonApi.schema,
  [TextFieldApi.name]: TextFieldApi.schema,
  [CheckBoxApi.name]: CheckBoxApi.schema,
  [ChoicePickerApi.name]: ChoicePickerApi.schema,
  [SliderApi.name]: SliderApi.schema,
  [DateTimeInputApi.name]: DateTimeInputApi.schema,
};
