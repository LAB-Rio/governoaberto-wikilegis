from django_comments.models import Comment
from django.conf import settings
from rest_framework import serializers

from wikilegis.auth2.models import User
from wikilegis.core.models import Bill, BillSegment, TypeSegment, UpDownVote


class CommentsUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'avatar')


class CommentsSerializer(serializers.ModelSerializer):
    content_type = serializers.SerializerMethodField('get_content_type_name')
    user = CommentsUserSerializer()

    def __init__(self, *args, **kwargs):
        super(CommentsSerializer, self).__init__(*args, **kwargs)

        try:
            request = kwargs.get('context').get('request')
            api_key = request.GET.get('api_key', None)

            if api_key and api_key == settings.API_KEY:
                self.fields['user'] = UserSerializer()
            else:
                self.fields['user'] = CommentsUserSerializer()
        except AttributeError:
            # When django initializes kwarg is None
            pass

    def get_content_type_name(self, obj):
        return obj.content_type.name

    class Meta:
        model = Comment
        fields = ('id', 'user', 'submit_date',
                  'content_type', 'object_pk', 'comment')


class CommentsSerializerForPost(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ('object_pk', 'comment')


class VoteSerializer(serializers.ModelSerializer):
    content_type = serializers.SerializerMethodField('get_content_type_name')
    user = CommentsUserSerializer()

    def get_content_type_name(self, obj):
        return obj.content_type.name

    class Meta:
        model = UpDownVote
        fields = ('id', 'user', 'content_type', 'object_id', 'vote')


class SegmentSerializer(serializers.ModelSerializer):
    author = CommentsUserSerializer()
    comments = CommentsSerializer(many=True)
    votes = VoteSerializer(many=True)

    class Meta:
        model = BillSegment
        fields = ('id', 'order', 'bill', 'original', 'replaced', 'parent',
                  'type', 'number', 'content', 'author', 'comments', 'votes',
                  'created', 'modified')


class SegmentSerializerForPost(serializers.ModelSerializer):
    bill = serializers.UUIDField()
    replaced = serializers.UUIDField()

    class Meta:
        model = BillSegment
        fields = ('bill', 'replaced', 'content')


class BillDetailSerializer(serializers.ModelSerializer):
    segments = SegmentSerializer(many=True)

    class Meta:
        model = Bill
        fields = ('id', 'title', 'epigraph', 'description',
                  'status', 'theme', 'segments', 'created', 'modified')


class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = ('id', 'title', 'epigraph', 'description',
                  'status', 'theme', 'segments')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'avatar')


class TypeSegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeSegment
        fields = ('id', 'name')


class UpDownVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = UpDownVote
        fields = ('user', 'content_type', 'object_id', 'vote')


class UpDownVoteSerializerForPost(serializers.ModelSerializer):
    class Meta:
        model = UpDownVote
        fields = ('object_id', 'vote')
