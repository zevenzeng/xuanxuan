import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import ContextMenu from '../../components/context-menu';
import Lang from '../../lang';
import App from '../../core';
import Member from '../../core/models/member';
import {MemberList} from '../common/member-list';
import replaceViews from '../replace-views';

const handleMemberItemClick = member => {
    App.im.ui.sendContentToChat(`@${member.displayName} `);
};

class ChatSidebarPeoples extends Component {
    static propTypes = {
        className: PropTypes.string,
        chat: PropTypes.object,
        children: PropTypes.any,
    };

    static defaultProps = {
        className: null,
        chat: null,
        children: null,
    };

    static get ChatSidebarPeoples() {
        return replaceViews('chats/chat-sidebar-peoples', ChatSidebarPeoples);
    }

    componentDidMount() {
        this.dataChangeEventHandler = App.events.onDataChange(data => {
            if (data && data.members) {
                this.forceUpdate();
            }
        });
    }

    componentWillUnmount() {
        App.events.off(this.dataChangeEventHandler);
    }

    handleItemRender = member => {
        const {chat} = this.props;
        let committerIcon = null;
        let adminIcon = null;
        if (!chat.isCommitter(member)) {
            committerIcon = <div data-hint={Lang.string('chat.committers.blocked')} className="hint--left side-icon text-gray inline-block"><Icon name="lock-outline" /></div>;
        }
        if (chat.isAdmin(member)) {
            adminIcon = <div data-hint={Lang.string('chat.role.admin')} className="hint--left side-icon text-gray inline-block"><Icon name="account-circle" /></div>;
        }
        if (committerIcon && adminIcon) {
            return <div>{committerIcon}{adminIcon}</div>;
        }
        return committerIcon || adminIcon;
    }

    handleItemContextMenu = (member, e) => {
        const items = App.im.ui.createChatMemberContextMenuItems(member);
        ContextMenu.show({x: e.pageX, y: e.pageY}, items);
        e.preventDefault();
    }

    render() {
        const {
            chat,
            className,
            children,
            ...other
        } = this.props;

        const userAccount = App.profile.userAccount;
        const members = Member.sort(chat.getMembersSet(App.members), [(x, y) => {
            if (x.account === userAccount) return -1;
            if (y.account === userAccount) return 1;
            const xIsAdmin = chat.isAdmin(x);
            const yIsAdmin = chat.isAdmin(y);
            if (xIsAdmin && !yIsAdmin) return -1;
            if (yIsAdmin && !xIsAdmin) return 1;
            return 0;
        }, 'status', 'namePinyin', '-id']);

        return (<div
            {...other}
            className={HTML.classes('app-chat-sidebar-peoples has-padding', className)}
        >
            <MemberList onItemClick={handleMemberItemClick} onItemContextMenu={this.handleItemContextMenu} itemRender={this.handleItemRender} className="white rounded compact" members={members} listItemProps={{avatarSize: 20}} />
            {children}
        </div>);
    }
}

export default ChatSidebarPeoples;
