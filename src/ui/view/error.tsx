import { ApplicationContext } from '../../context';

export function ErrorMessage(props: { ctx: ApplicationContext }) {
    return <div>{'Error: ' + props.ctx.state.data.response.state?.info.message}</div>;
}
