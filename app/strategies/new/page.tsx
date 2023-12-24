import { Form } from "./_components/form/form"
import { InfoBar } from "./_components/info-bar"

export default function Page() {
  return (
    <div className="grid grid-rows-[auto,1fr] h-[calc(100vh-var(--bar-height))] w-full">
      <InfoBar />
      <div className="grid grid-cols-[25.375rem,1fr] max-w-8xl mx-auto w-full overflow-auto">
        <div className="overflow-auto p-6 border-r border-l">
          <Form />
        </div>
        <div className="overflow-auto p-6 border-r">
          {/* Content of the right column goes here */}
          <h1>Content</h1>
        </div>
      </div>
    </div>
  )
}
