import Pagination from "./pagination";
import LayoutSelector from "./LayoutSelector";

export default function Toolbar() {
    return (
        <>
            <div className="flex-grow basis-1"/>
            <Pagination />
            <div className="flex-grow basis-1 flex flex-row-reverse">
                <LayoutSelector />
            </div>
        </>
    )
}