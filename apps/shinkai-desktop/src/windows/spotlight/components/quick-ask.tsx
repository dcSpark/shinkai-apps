import { ScrollArea, Separator } from '@shinkai_network/shinkai-ui';

function QuickAsk() {
  return (
    <div className="relative flex size-full flex-col">
      <div
        className="absolute top-0 z-50 h-8 w-full"
        data-tauri-drag-region={true}
      />
      <div className="font-lg flex h-[60px] shrink-0 items-center space-x-3 px-5 py-2">
        <input
          autoFocus
          className="flex-grow bg-transparent text-lg text-white placeholder:text-gray-200 focus:outline-none"
          placeholder="Ask a question..."
          type="text"
        />
      </div>
      <Separator className="bg-gray-350" />
      <ScrollArea className="flex-1 p-3 text-sm">
        <div className="p-2">
          {/*// insert a long text */}
          ###Instructions### Begin by affirming in the prompt that it is aimed
          at an expert in the field. Use clear and comprehensive instructions to
          guide the generation of content. Separate the instruction section from
          the context section with a line of dashes (--). ###Context### As a
          seasoned culinary expert, craft a detailed recipe for a mouth-watering
          dish inspired by traditional Italian cuisine. Your recipe should
          showcase a perfect blend of flavors, textures, and presentation that
          epitomize the essence of Italian cooking. Provide step-by-step
          instructions, highlighting key techniques, ingredients, and cooking
          methods to ensure an authentic and delicious outcome. Incorporate
          personal anecdotes or cultural references to enhance the storytelling
          aspect of the recipe. The final dish sho ###Instructions### Begin by
          affirming in the prompt that it is aimed at an expert in the field.
          Use clear and comprehensive instructions to guide the generation of
          content. Separate the instruction section from the context section
          with a line of dashes (--). ###Context### As a seasoned culinary
          expert, craft a detailed recipe for a mouth-watering dish inspired by
          traditional Italian cuisine. Your recipe should showcase a perfect
          blend of flavors, textures, and presentation that epitomize the
          essence of Italian cooking. Provide step-by-step instructions,
          highlighting key techniques, ingredients, and cooking methods to
          ensure an authentic and delicious outcome. Incorporate personal
          anecdotes or cultural references to enhance the storytelling aspect of
          the recipe. The final dish sho ###Instructions### Begin by affirming
          in the prompt that it is aimed at an expert in the field. Use clear
          and comprehensive instructions to guide the generation of content.
          Separate the instruction section from the context section with a line
          of dashes (--). ###Context### As a seasoned culinary expert, craft a
          detailed recipe for a mouth-watering dish inspired by traditional
          Italian cuisine. Your recipe should showcase a perfect blend of
          flavors, textures, and presentation that epitomize the essence of
          Italian cooking. Provide step-by-step instructions, highlighting key
          techniques, ingredients, and cooking methods to ensure an authentic
          and delicious outcome. Incorporate personal anecdotes or cultural
          references to enhance the storytelling aspect of the recipe. The final
          dish sho
          {/* Add search results or recent items here */}
        </div>
      </ScrollArea>
      <Separator className="bg-gray-350" />
      <div className="flex h-10 w-full items-center justify-between px-4 py-1.5 text-xs">
        <div>
          <button className="text-gray-80 flex items-center justify-center gap-2 rounded-md px-1.5 py-0.5 text-center transition-colors hover:bg-gray-300">
            <span>Full Text Input </span>
            <span className="flex items-center gap-1">
              <kbd className="text-gray-1100 flex h-5 w-5 items-center justify-center rounded-md bg-gray-300 px-1 font-sans">
                ⌘
              </kbd>
              <kbd className="text-gray-1100 flex h-5 w-5 items-center justify-center rounded-md bg-gray-300 px-1 font-sans">
                N
              </kbd>
            </span>
          </button>
        </div>
        <div>
          <button className="text-gray-80 flex items-center justify-center gap-2 rounded-md px-1.5 py-0.5 text-center transition-colors hover:bg-gray-300">
            <span>Submit</span>
            <kbd className="text-gray-1100 flex h-5 w-5 items-center justify-center rounded-md bg-gray-300 px-1 font-sans">
              ↵
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickAsk;
